const canvas = document.getElementById('canvas');
const count_x_input = document.getElementById('count_x');
const coef_D_input = document.getElementById('coef_D');
const coef_v_x_input = document.getElementById('coef_v_x');
const coef_v_y_input = document.getElementById('coef_y');
const coef_t_input = document.getElementById('coef_t');
const num_x_input = document.getElementById('num_x');
const num_y_input = document.getElementById('num_y');
const start_btn = document.getElementById('start_btn');
const draw_btn = document.getElementById('draw_btn');
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
    let nx = 70;
    let ny = 70;
    let nt = 60;
    let a1 = 0;
    let b1 = 1000;
    let a2 = 0;
    let b2 = 1000;
    let D = 0.01;
    let v_x = 0.01;
    let v_y = 0.01;
    let t0 = 0;
    let tf = 10000;
    let dx = (b1 - a1) / (nx - 1);
    let dy = (b2 - a2) / (ny - 1);
    let dt = (tf - t0) / (nt - 1);
    let x = [];
    let y = [];
    let t = [];
    let anim_speed = 10;
    let concentration_dot = 15
    let cell_x = ctxWidth / nx
    let cell_y = ctxHeight / ny

    const xScale = ctxWidth / (b1 - a1);
    const yScale = ctxHeight - 50;
    const dx1 = dt / (dx);
    const dx2 = dt / Math.pow(dx, 2);
    const dy1 = dt / (dy);
    const dy2 = dt / Math.pow(dy, 2);

    const UN = new Array(nt).fill(0).map(() => new Array(nx).fill(0).map(() => new Array(ny).fill(0)));

    const add_event_input = (name_input, name) => name_input.value = name

    const init_vars = () => {
        add_event_input(coef_D_input, D);
        add_event_input(coef_t_input, anim_speed);
        add_event_input(coef_v_x_input, v_x);
        add_event_input(coef_v_y_input, v_y);
        add_event_input(num_x_input, concentration_dot);
        add_event_input(num_y_input, concentration_dot);
    }
    init_vars()

    const solve_equation = () => {
        for (let n = 0; n < nt; n++) {
            for (let j = 0; j < ny; j++) {
                for (let i = 0; i < nx; i++) {
                    UN[n][i][j] = 0
                }
            }
        }
        UN[0][num_x_input.value][num_y_input.value] = 1
        for (let i = a1; i <= b1;
             i += dx
        ) {
            x.push(i)
        }
        for (let j = a2; j <= b2;
             j += dy
        ) {
            y.push(j)
        }
        for (let i = t0; i <= tf; i += dt) {
            t.push(i)
        }
        for (let n = 0; n < nt - 1; n++) {
            for (let j = 1; j < ny - 1; j++) {
                for (let i = 1; i < nx - 1; i++) {
                    UN[n + 1][i][j] = UN[n][i][j]
                        + coef_D_input.value * dx2 * (UN[n][i + 1][j] - 2 * UN[n][i][j] + UN[n][i - 1][j])
                        + coef_D_input.value * dy2 * (UN[n][i][j + 1] - 2 * UN[n][i][j] + UN[n][i][j - 1])
                        - coef_v_x_input.value * dx1 * (UN[n][i][j] - UN[n][i - 1][j])
                        - coef_v_y_input.value * dy1 * (UN[n][i][j] - UN[n][i][j - 1]);
                }
            }
        }
        console.log(UN);
    }
    solve_equation()
    const draw_lines = (n) => {
        for (let j = 0; j < ny; j++) {
            for (let i = 0; i < nx; i++) {
                ctx.beginPath();
                ctx.fillStyle = `rgba(55,55,55,${(UN[n][i][j])*80})`;
                ctx.fillRect(i * cell_x, j * cell_y, cell_x, cell_y);
                ctx.closePath();
                UN[n][i][j] !==0 && console.log(UN[n][i][j]);
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
        for (let i = setTimeout(function () {
        }, 0); i > 0; i--) {
            window.clearInterval(i);
            window.clearTimeout(i);
        }
    }

    const async_draw = (func) => {
        clearAll()
        x = [];
        t = [];
        solve_equation()
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        for (let n = 0; n < nt; n++) {
            setTimeout(() => func(n), coef_t_input.value * n)
        }
    }

    const add_event_btn = () => {
        start_btn.addEventListener('click', () => async_draw(draw_anim))
        draw_btn.addEventListener('click', () => async_draw(draw_all))
    }
    add_event_btn()
}
