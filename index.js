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

const btn_scroll = document.getElementById('scroll_btn')

const anim_time_info = document.getElementById("anim_time_info")
const square_common = document.getElementById("square_common")
const square_value = document.getElementById("square_value")

//const draw_btn = document.getElementById('draw_btn');
const ctx = canvas.getContext('2d')

const ctxWidth = 500;
const ctxHeight = 500;

btn_scroll.addEventListener('click', () => {
    // window.scroll({ top: 100px, behavior: 'smooth' })
    field_size_input.scrollIntoView({behavior: 'smooth'})
})

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
    let x_0 = 0;
    let x_1 = 10;
    let t_0 = 0;
    let t_finish = 259200;

    //const
    let T = 23;
    let D
    let m = 1000;
    let v_x = 0.01;
    let v_y = 0.03;

    //table parameters
    let field_size = x_1 - x_0
    let number_of_divisions_axis = 40;
    let number_of_time_steps = 70;
    let cell_area
    let dx = field_size / number_of_divisions_axis
    let dy = field_size / number_of_divisions_axis
    let dt = (t_finish - t_0) / (number_of_time_steps - 1);
    let x = [];
    let y = [];
    let t = [];
    let fps = 100;

    let position_of_start_point = number_of_divisions_axis / 4
    let cell_width = ctxWidth / number_of_divisions_axis
    let cell_height = ctxHeight / number_of_divisions_axis

    //const for equations
    let ro_x
    let ro_y
    let dx1 = dt / (dx);
    let dx2 = dt / Math.pow(dx, 2);
    let dy1 = dt / (dy);
    let dy2 = dt / Math.pow(dy, 2);
    let area_of_pollution = 0
    let area_of_all_pollution = 0;

    const UN = new Array(number_of_time_steps).fill(0).map(() => new Array(number_of_divisions_axis).fill(0).map(() => new Array(number_of_divisions_axis).fill(0)));

    const add_event_input = (name_input, name) => name_input.value = name

    const init_vars = () => {
        add_event_input(coef_m_input, m);
        add_event_input(anim_time, t_finish / 3600);
        add_event_input(field_size_input, field_size);
        add_event_input(coef_Temp_input, T);
        add_event_input(coef_t_input, fps);
        add_event_input(coef_v_x_input, v_x);
        add_event_input(coef_v_y_input, v_y);
        add_event_input(num_x_input, position_of_start_point);
        add_event_input(num_y_input, position_of_start_point);
    }

    init_vars()

    const handle_change = (name_input, name) => name_input.value = name

    const init_vars_after_change = () => {
        handle_change(coef_m_input, m);
        handle_change(anim_time, t_finish / 3600);
        handle_change(field_size_input, field_size);
        handle_change(coef_Temp_input, T);
        handle_change(coef_t_input, fps);
        handle_change(coef_v_x_input, v_x);
        handle_change(coef_v_y_input, v_y);
        handle_change(num_x_input, position_of_start_point);
        handle_change(num_y_input, position_of_start_point);
    }

    const solve_equation = (time_step) => {
        let cells = find_polluted_cells(time_step);
        if (time_step < number_of_time_steps - 1) {
            area_of_pollution = 0
            area_of_all_pollution = 0
            for (let i = 1; i < number_of_divisions_axis - 1; i++) {
                for (let j = 1; j < number_of_divisions_axis - 1; j++) {
                     UN[time_step + 1][i][j] = UN[time_step][i][j]
                        + D * dx2 * (UN[time_step][i + 1][j] - 2 * UN[time_step][i][j] + UN[time_step][i - 1][j])
                        + D * dy2 * (UN[time_step][i][j + 1] - 2 * UN[time_step][i][j] + UN[time_step][i][j - 1])
                        - coef_v_x_input.value * ro_x * dx1 * (UN[time_step][i][j] - UN[time_step][i - 1][j])
                        - coef_v_x_input.value * (1 - ro_x) * dx1 * (UN[time_step][i + 1][j] - UN[time_step][i][j])
                        - coef_v_y_input.value * ro_y * dy1 * (UN[time_step][i][j] - UN[time_step][i][j - 1])
                        - coef_v_y_input.value * (1 - ro_y) * dy1 * (UN[time_step][i][j + 1] - UN[time_step][i][j])
                    UN[time_step][i][j] > Math.pow(10, -10) && area_of_pollution++
                    UN[time_step][i][j] > Math.pow(10, -25) && area_of_all_pollution++
                    if (coef_v_y_input.value * ro_y * dy1 * (UN[time_step][i][j] - UN[time_step][i][j - 1]) > 0) {
                        // debugger
                        // console.log({
                        //     sum: UN[time_step + 1][i][j],
                        //     1:UN[time_step][i][j],
                        //     2:D * dx2 * (UN[time_step][i + 1][j] - 2 * UN[time_step][i][j] + UN[time_step][i - 1][j]),
                        //     3:D * dy2 * (UN[time_step][i][j + 1] - 2 * UN[time_step][i][j] + UN[time_step][i][j - 1]),
                        //     4: - coef_v_x_input.value * ro_x * dx1 * (UN[time_step][i][j] - UN[time_step][i - 1][j]),
                        //     5:- coef_v_x_input.value * (1 - ro_x) * dx1 * (UN[time_step][i + 1][j] - UN[time_step][i][j]),
                        //     6:- coef_v_y_input.value * ro_y * dy1 * (UN[time_step][i][j] - UN[time_step][i][j - 1]),
                        //     7: - coef_v_y_input.value * (1 - ro_y) * dy1 * (UN[time_step][i][j + 1] - UN[time_step][i][j])
                        // });
                        console.log(coef_v_y_input.value * ro_y * dy1 * (UN[time_step][i][j] - UN[time_step][i][j - 1]))
                    }

                    //UN[time_step][i][j] > parseFloat(coef_m_input.value) / cell_area - 0.001 && console.log(UN[time_step][i][j]);
                    //> parseFloat(coef_m_input.value) / cell_area - 0.001
                }
            }
            square_value.innerText = `${(area_of_pollution * parseFloat(cell_area) * Math.pow(10, -6)).toFixed(3)} km^2`
            square_common.innerText = `${(area_of_all_pollution * parseFloat(cell_area) * Math.pow(10, -6)).toFixed(3)} km^2`
        }
    }

    const solve_equation_without_velocity = (time_step) => {
        if (time_step < number_of_time_steps - 1) {
            for (let i = 1; i < number_of_divisions_axis - 1; i++) {
                for (let j = 1; j < number_of_divisions_axis - 1; j++) {
                   UN[time_step + 1][i][j] = UN[time_step][i][j]
                        + D * dx2 * (UN[time_step][i + 1][j] - 2 * UN[time_step][i][j] + UN[time_step][i - 1][j])
                        + D * dy2 * (UN[time_step][i][j + 1] - 2 * UN[time_step][i][j] + UN[time_step][i][j - 1])
                        - coef_v_x_input.value * dx1 * (UN[time_step][i][j] - UN[time_step][i - 1][j])
                        - coef_v_y_input.value * dy1 * (UN[time_step][i][j] - UN[time_step][i][j - 1])
                }
            }
        }
    }

    const calculate = (time_step) => {
        const hours_per_day = 3600;
        anim_time_info.innerText = `${(parseFloat(time_step) * dt / hours_per_day).toFixed(1)} hr`
        Number(coef_v_x_input.value) || Number(coef_v_y_input.value) ? solve_equation(time_step) : solve_equation_without_velocity(time_step)
    }

    const draw_field = (time_step) => {
        let max_concentration = find_max_concentration(time_step);
        let cells = find_polluted_cells(time_step);
        //console.log(cells);
        for (let j = 0; j < number_of_divisions_axis; j++) {
            for (let i = 0; i < number_of_divisions_axis; i++) {
                ctx.beginPath();
                let concentration = UN[time_step][i][j] ? parseFloat(UN[time_step][i][j]) : 0;
                let proportion = concentration / max_concentration;
                let color = concentration !== 0 ? percentToColor(proportion) : "rgb(0, 0, 255)";
                ctx.fillStyle = color;
                ctx.fillRect(i * cell_width, j * cell_height, cell_width, cell_height);
                ctx.closePath();
            }
        }
    }

    const find_max_concentration = (time_step) => {
        let max_concentration = 0;
        for (let i = 0; i < number_of_divisions_axis; i++) {
            for (let j = 0; j < number_of_divisions_axis; j++) {
                let value = UN[time_step][i][j];
                if (value > max_concentration){
                    max_concentration = value;
                }
            }
        }

        return max_concentration;
    }

    const find_polluted_cells = (time_step) => {
        let max_concentration = find_max_concentration(time_step);
        let cells = []
        for (let i = 0; i < number_of_divisions_axis; i++) {
            for (let j = 0; j < number_of_divisions_axis; j++) {
                let value = UN[time_step][i][j];
                if (value > max_concentration * 0.05){
                    cells.push({i: i, j: j}, value);
                }
            }
        }

        return cells;
    }

    const percentToColor = (percent) => {
        let h = (1.0 - percent) * 240
        return "hsl(" + h + ", 100%, 50%)";
    }


    function clearAll() {
        for (let i = setTimeout(function () {
        }, 0); i > 0; i--) {
            window.clearInterval(i);
            window.clearTimeout(i);
        }
    }

    const initialize = () => {
        // calculate vars after change input's values
        field_size = parseFloat(field_size_input.value) * 1000
        dx = (field_size) / (number_of_divisions_axis - 1);
        dy = (field_size) / (number_of_divisions_axis - 1);
        cell_area = ((field_size) / number_of_divisions_axis) * ((field_size) / number_of_divisions_axis);

        t_finish = anim_time.value * 3600
        dt = (t_finish - t_0) / (number_of_time_steps - 1);
        dx1 = dt / (dx);
        dx2 = dt / Math.pow(dx, 2);
        dy1 = dt / (dy);
        dy2 = dt / Math.pow(dy, 2);
        D = 4.13 * Math.pow(coef_Temp_input.value, 153 / 100) * 2.78 * Math.pow(10, -11);

        for (let n = 0; n < number_of_time_steps; n++) {
            for (let j = 0; j < number_of_divisions_axis; j++) {
                for (let i = 0; i < number_of_divisions_axis; i++) {
                    UN[n][i][j] = 0
                }
            }
        }
        ro_x = Number(coef_v_x_input.value) ? (Number(coef_v_x_input.value) + Math.abs(Number(coef_v_x_input.value))) / (2 * Math.abs(Number(coef_v_x_input.value))) : 0;
        ro_y = Number(coef_v_y_input.value) ? (Number(coef_v_y_input.value) + Math.abs(Number(coef_v_y_input.value))) / (2 * Math.abs(Number(coef_v_y_input.value))) : 0;
        //set initial conditional
        UN[0][num_x_input.value][num_y_input.value] = parseFloat(coef_m_input.value) / cell_area


        //clear x and y arrays and Intervals
        clearAll()

        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        //start draw and put to the draw func n (it's time moment)
        for (let time_step = 0; time_step < number_of_time_steps; time_step++) {
            setTimeout(() => {
                ctx.clearRect(0, 0, ctxWidth, ctxHeight);
                calculate(time_step)
                draw_field(time_step)
            }, coef_t_input.value * time_step)
        }
    }

    const add_event_btn = () => {
        start_btn.addEventListener('click', initialize)
        //draw_btn.addEventListener('click', () => initialize(draw_all))
    }

    add_event_btn()
}
