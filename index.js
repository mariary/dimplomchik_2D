const canvas = document.getElementById('canvas');
const count_x_input = document.getElementById('count_x');
const field_size_input = document.getElementById('field_size');
const coef_Temp_input = document.getElementById('coef_Temp');
const coef_m_input = document.getElementById('coef_m');
const coef_v_x_input = document.getElementById('coef_v_x');
const coef_v_y_input = document.getElementById('coef_y');
const coef_t_input = document.getElementById('coef_t');
const num_x_input = document.getElementById('num_x');
const num_y_input = document.getElementById('num_y');
const start_btn = document.getElementById('start_btn');
const anim_time = document.getElementById('anim_time');

const anim_time_info = document.getElementById("anim_time_info")
const square_common = document.getElementById("square_common")
const square_value = document.getElementById("square_value")

//const draw_btn = document.getElementById('draw_btn');
const ctx = canvas.getContext('2d')

const ctxWidth = 500;
const ctxHeight = 500;

const resize = () => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    canvas.width = ctxWidth;
    canvas.height = ctxHeight;
}
resize()
window.addEventListener("load", main_equations);

function main_equations() {
    //area and time
    let a1 = 0;
    let b1 = 100;
    let a2 = 0;
    let b2 = 10;
    let t0 = 0;
    let tf = 1800000;

    //const
    let T = 23;
    let D
    let m = 1000;
    let v_x = 0.01;
    let v_y = 0.01;

    //table parameters
    let field_size = b1 - a1
    let nx_ny = 40;
    let nt = 50;
    let s_cell
    let dx = field_size / nx_ny
    let dy = field_size / nx_ny
    let dt = (tf - t0) / (nt - 1);
    let x = [];
    let y = [];
    let t = [];
    let anim_speed = 100;
    let concentration_dot = nx_ny / 4
    let cell_x = ctxWidth / nx_ny
    let cell_y = ctxHeight / nx_ny
    let ro_x
    let ro_y
    const xScale = ctxWidth / (b1 - a1);
    const yScale = ctxHeight - 50;
    let dx1 = dt / (dx);
    let dx2 = dt / Math.pow(dx, 2);
    let dy1 = dt / (dy);
    let dy2 = dt / Math.pow(dy, 2);
    let s_cell_pollution = 0
    let s_cell_all_pollution = 0

    const UN = new Array(nt).fill(0).map(() => new Array(nx_ny).fill(0).map(() => new Array(nx_ny).fill(0)));

    const add_event_input = (name_input, name) => name_input.value = name

    const init_vars = () => {
        add_event_input(coef_m_input, m);
        add_event_input(anim_time, tf / 3600);
        add_event_input(field_size_input, field_size);
        add_event_input(coef_Temp_input, T);
        add_event_input(coef_t_input, anim_speed);
        add_event_input(coef_v_x_input, v_x);
        add_event_input(coef_v_y_input, v_y);
        add_event_input(num_x_input, concentration_dot);
        add_event_input(num_y_input, concentration_dot);
    }
    init_vars()

    const beforeSolveEquation = () => {
        for (let i = 0; i <= field_size;
             i += dx
        ) {
            x.push(i)
        }
        for (let j = 0; j <= field_size;
             j += dy
        ) {
            y.push(j)
        }
        for (let i = t0; i <= tf; i += dt) {
            t.push(i)
        }
    }


    const solve_equation = (n) => {
        if (n < nt - 1) {
            s_cell_pollution = 0
            s_cell_all_pollution = 0
            for (let j = 1; j < nx_ny - 1; j++) {
                for (let i = 1; i < nx_ny - 1; i++) {
                    UN[n + 1][i][j] = UN[n][i][j]
                        + D * dx2 * (UN[n][i + 1][j] - 2 * UN[n][i][j] + UN[n][i - 1][j])
                        + D * dy2 * (UN[n][i][j + 1] - 2 * UN[n][i][j] + UN[n][i][j - 1])
                        - coef_v_x_input.value * ro_x * dx1 * (UN[n][i][j] - UN[n][i - 1][j])
                        - coef_v_x_input.value * (1 - ro_x) * dx1 * (UN[n][i + 1][j] - UN[n][i][j])
                        - coef_v_y_input.value * ro_y * dy1 * (UN[n][i][j] - UN[n][i][j - 1])
                        - coef_v_y_input.value * (1 - ro_y) * dy1 * (UN[n][i][j + 1] - UN[n][i][j])
                    UN[n][i][j] > Math.pow(10, -10) && s_cell_pollution++
                    UN[n][i][j] > Math.pow(10, -25) && s_cell_all_pollution++
                    //UN[n][i][j] > parseFloat(coef_m_input.value) / s_cell - 0.001 && console.log(UN[n][i][j]);
                    //> parseFloat(coef_m_input.value) / s_cell - 0.001
                }
            }
            square_value.innerText = `${s_cell_pollution * parseFloat(s_cell) * Math.pow(10, -6)} km^2`
            square_common.innerText = `${s_cell_all_pollution * parseFloat(s_cell) * Math.pow(10, -6)} km^2`
        }
    }

    const solve_equation_without_velocity = (n) => {
        if (n < nt - 1) {
            for (let j = 1; j < nx_ny - 1; j++) {
                for (let i = 1; i < nx_ny - 1; i++) {
                    UN[n + 1][i][j] = UN[n][i][j]
                        + D * dx2 * (UN[n][i + 1][j] - 2 * UN[n][i][j] + UN[n][i - 1][j])
                        + D * dy2 * (UN[n][i][j + 1] - 2 * UN[n][i][j] + UN[n][i][j - 1])
                        - coef_v_x_input.value * dx1 * (UN[n][i][j] - UN[n][i - 1][j])
                        - coef_v_y_input.value * dy1 * (UN[n][i][j] - UN[n][i][j - 1])
                    //console.log(UN[n][i][j]);
                }
            }
        }
    }

    //solve_equation()
    const draw_lines = (time_moment) => {
        anim_time_info.innerText = `${(parseFloat(time_moment) * dt / 3600).toFixed(1)} hr`
        Number(coef_v_x_input.value) || Number(coef_v_y_input.value) ? solve_equation(time_moment) : solve_equation_without_velocity(time_moment)
        for (let j = 0; j < nx_ny; j++) {
            for (let i = 0; i < nx_ny; i++) {
                ctx.beginPath();
                ctx.fillStyle = `rgba(55,55,55,${UN[time_moment][i][j] ? (parseFloat(UN[time_moment][i][j]) * s_cell * 100) : 0})`;
                //ctx.fillStyle = `rgba(55,55,55,${UN[time_moment][i][j] ? (parseFloat(UN[time_moment][i][j]) / parseFloat(coef_m_input.value) * s_cell * 10) : 0})`;
                ctx.fillRect(i * cell_x, j * cell_y, cell_x, cell_y);
                ctx.closePath();
                //UN[n][i][j] !== 0 && console.log(UN[n][i][j]);
            }
        }
    }

    const draw_anim = (n) => {

        ctx.clearRect(0, 0, ctxWidth, ctxHeight);
        draw_lines(n)
    }

    const draw_all = (n) => {
        draw_lines(n)
    }

    function clearAll() {
        x = [];
        t = [];
        for (let i = setTimeout(function () {
        }, 0); i > 0; i--) {
            window.clearInterval(i);
            window.clearTimeout(i);
        }
    }

    const async_draw = (func) => {
        beforeSolveEquation()
        // calculate vars after change input's values
        field_size = parseFloat(field_size_input.value) * 1000
        dx = (field_size) / (nx_ny - 1);
        dy = (field_size) / (nx_ny - 1);
        s_cell = ((field_size) / nx_ny) * ((field_size) / nx_ny);
        tf = anim_time.value * 3600
        dt = (tf - t0) / (nt - 1);
        dx1 = dt / (dx);
        dx2 = dt / Math.pow(dx, 2);
        dy1 = dt / (dy);
        dy2 = dt / Math.pow(dy, 2);
        D = 4.13 * Math.pow(coef_Temp_input.value, 153 / 100) * 2.78 * Math.pow(10, -11);
        for (let n = 0; n < nt; n++) {
            for (let j = 0; j < nx_ny; j++) {
                for (let i = 0; i < nx_ny; i++) {
                    UN[n][i][j] = 0
                }
            }
        }
        ro_x = Number(coef_v_x_input.value) ? (Number(coef_v_x_input.value) + Math.abs(Number(coef_v_x_input.value))) / (2 * Math.abs(Number(coef_v_x_input.value))) : 0;
        ro_y = Number(coef_v_y_input.value) ? (Number(coef_v_y_input.value) + Math.abs(Number(coef_v_y_input.value))) / (2 * Math.abs(Number(coef_v_y_input.value))) : 0;
        //set initial conditional
        UN[0][num_x_input.value][num_y_input.value] = parseFloat(coef_m_input.value) / s_cell

        //clear x and y arrays and Intervals
        clearAll()

        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        //start draw and put to the draw func n (it's time moment)
        for (let n = 0; n < nt; n++) {
            setTimeout(() => func(n), coef_t_input.value * n)
        }
    }

    const add_event_btn = () => {
        start_btn.addEventListener('click', () => async_draw(draw_anim))
        //draw_btn.addEventListener('click', () => async_draw(draw_all))
    }
    add_event_btn()
}
