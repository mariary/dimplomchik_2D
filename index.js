import Cell from "./cell.js";

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
    let t_finish = 2 * 60 * 60;

    //const
    let T = 23;
    let D
    let m = 1000;
    let v_x = 0.5;
    let v_y = 0.5;

    //table parameters
    let field_size = x_1 - x_0
    let number_of_divisions_axis = 60;
    let number_of_time_steps = 70;
    let cell_area
    let dx = field_size / number_of_divisions_axis
    let dy = field_size / number_of_divisions_axis
    let dt = (t_finish - t_0) / (number_of_time_steps - 1);
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

    const UN = new Array(number_of_time_steps).fill(null).map(() => new Array(number_of_divisions_axis).fill(null).map(() => new Array(number_of_divisions_axis).fill(null)));

    let polluted_cells = []

    const set_empty_cells = () => {
        for (let n = 0; n < number_of_time_steps; n++) {
            for (let j = 0; j < number_of_divisions_axis; j++) {
                for (let i = 0; i < number_of_divisions_axis; i++) {
                    UN[n][i][j] = new Cell(0, false)
                }
            }
        }
    }

    set_empty_cells()
    console.log(UN.length, UN[0].length, UN[0][0].length);
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
        if (time_step < number_of_time_steps - 1) {
            area_of_pollution = 0
            area_of_all_pollution = 0
            for (let i = 1; i < number_of_divisions_axis - 1; i++) {
                for (let j = 1; j < number_of_divisions_axis - 1; j++) {

                    if (UN[time_step][i][j].is_earth){
                        continue
                    }

                    UN[time_step + 1][i][j].value = UN[time_step][i][j].value

                    if (!(UN[time_step][i + 1][j].is_earth || UN[time_step][i - 1][j].is_earth)){
                        UN[time_step + 1][i][j].value += D * dx2 * (UN[time_step][i + 1][j].value - 2 * UN[time_step][i][j].value + UN[time_step][i - 1][j].value)
                    }

                    if (!(UN[time_step][i][j + 1].is_earth || UN[time_step][i][j - 1].is_earth)){
                        UN[time_step + 1][i][j].value += D * dy2 * (UN[time_step][i][j + 1].value - 2 * UN[time_step][i][j].value + UN[time_step][i][j - 1].value)
                    }

                    if (!UN[time_step][i - 1][j].is_earth){
                        UN[time_step + 1][i][j].value -= coef_v_x_input.value * ro_x * dx1 * (UN[time_step][i][j].value - UN[time_step][i - 1][j].value)
                    } else {
                        UN[time_step + 1][i][j].value += coef_v_x_input.value * ro_x * dx1 * (UN[time_step][i][j].value - UN[time_step][i - 1][j].value) * 0.2
                    }

                    if (!UN[time_step][i + 1][j].is_earth){
                        UN[time_step + 1][i][j].value -= coef_v_x_input.value * (1 - ro_x) * dx1 * (UN[time_step][i + 1][j].value - UN[time_step][i][j].value)
                    } else {
                        UN[time_step + 1][i][j].value += coef_v_x_input.value * (1 - ro_x) * dx1 * (UN[time_step][i + 1][j].value - UN[time_step][i][j].value) * 0.2
                    }

                    if (!UN[time_step][i][j - 1].is_earth){
                        UN[time_step + 1][i][j].value -= coef_v_y_input.value * ro_y * dy1 * (UN[time_step][i][j].value - UN[time_step][i][j - 1].value)
                    } else {
                        UN[time_step + 1][i][j].value += coef_v_y_input.value * ro_y * dy1 * (UN[time_step][i][j].value - UN[time_step][i][j - 1].value) * 0.2
                    }

                    if (!UN[time_step][i][j + 1].is_earth && !UN[time_step][i][j].is_earth){
                        UN[time_step + 1][i][j].value -= coef_v_y_input.value * (1 - ro_y) * dy1 * (UN[time_step][i][j + 1].value - UN[time_step][i][j].value)
                    } else {
                        UN[time_step + 1][i][j].value += coef_v_y_input.value * (1 - ro_y) * dy1 * (UN[time_step][i][j + 1].value - UN[time_step][i][j].value) * 0.2
                    }

                    UN[time_step][i][j].value > Math.pow(10, -10) && area_of_pollution++
                    UN[time_step][i][j].value > Math.pow(10, -25) && area_of_all_pollution++
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
                   UN[time_step + 1][i][j].value = UN[time_step][i][j].value
                        + D * dx2 * (UN[time_step][i + 1][j].value - 2 * UN[time_step][i][j].value + UN[time_step][i - 1][j].value)
                        + D * dy2 * (UN[time_step][i][j + 1].value - 2 * UN[time_step][i][j].value + UN[time_step][i][j - 1].value)
                        - coef_v_x_input.value * dx1 * (UN[time_step][i][j].value - UN[time_step][i - 1][j].value)
                        - coef_v_y_input.value * dy1 * (UN[time_step][i][j].value - UN[time_step][i][j - 1].value)
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
        find_polluted_cells(time_step)
        draw_polluted_cells()
        console.log(polluted_cells)
        let max_concentration = find_max_concentration(time_step);
        for (let j = 0; j < number_of_divisions_axis; j++) {
            for (let i = 0; i < number_of_divisions_axis; i++) {
                ctx.beginPath();
                let concentration = UN[time_step][i][j].value ? parseFloat(UN[time_step][i][j].value) : 0;
                let proportion = concentration / max_concentration;
                //let color = concentration !== 0 ? percentToColor(proportion) : "rgb(0, 0, 255)";
                let color = proportion > 0.05  ? percentToColor(proportion) : "rgba(0, 0, 255,0)";

                if (UN[time_step][i][j].is_earth){
                    color = "white"
                }

                ctx.fillStyle = color;
                ctx.fillRect(i * cell_width, j * cell_height, cell_width, cell_height);
                ctx.closePath();
            }
        }
    }

    const draw_field_with_numbers = (time_step) => {
        let max_concentration = find_max_concentration(time_step);
        for (let j = 0; j < number_of_divisions_axis; j++) {
            for (let i = 0; i < number_of_divisions_axis; i++) {
                ctx.beginPath();
                let concentration = UN[time_step][i][j].value ? parseFloat(UN[time_step][i][j].value) : 0;
                let proportion = concentration / max_concentration;
                let color = concentration !== 0 ? percentToColor(proportion) : "rgb(0, 0, 255)";
                ctx.strokeStyle = color;
                if (UN[time_step][i][j].value > 0.05) {
                    ctx.strokeRect(i * cell_width, j * cell_height, cell_width, cell_height);
                    print_number_in_rectangle(i ,j ,cell_width,cell_height,proportion)
                }
                ctx.closePath();
            }
        }
    }

    const print_number_in_rectangle = (x, y, width, height, value) => {
        ctx.fillStyle = "black";
        ctx.font = "8px serif";
        ctx.fillText(value.toFixed(3), x * width, y * height + height / 2)
    }

    const find_max_concentration = (time_step) => {
        let max_concentration = 0;
        for (let i = 0; i < number_of_divisions_axis; i++) {
            for (let j = 0; j < number_of_divisions_axis; j++) {
                let value = UN[time_step][i][j].value;
                if (value > max_concentration){
                    max_concentration = value;
                }
            }
        }

        return max_concentration;
    }

    const find_polluted_cells = (time_step) => {
        let max_concentration = find_max_concentration(time_step);
        for (let i = 0; i < number_of_divisions_axis; i++) {
            for (let j = 0; j < number_of_divisions_axis; j++) {
                let value = UN[time_step][i][j].value;
                if (value > max_concentration * 0.05){
                    polluted_cells.push({x: i, y: j})
                }
            }
        }
    }

    const draw_polluted_cells = () => {
        for (let i = 0; i < polluted_cells.length; i++){
            let cell = polluted_cells[i];
            ctx.beginPath();
            ctx.fillStyle = "rgba(26,36,73,0.1)";
            ctx.fillRect(cell.x * cell_width, cell.y * cell_height, cell_width, cell_height);
            ctx.closePath();
        }
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

    const set_earth = (list) => {
        for (let n = 0; n < number_of_time_steps; n++) {
            for (let index = 0; index < list.length; index++){
                UN[n][list[index].x][list[index].y].is_earth = true;
            }
        }
    }

    const initialize = () => {
        // calculate vars after change input's values
        polluted_cells = []
        field_size = parseFloat(field_size_input.value) * 1000
        dx = (field_size) / (number_of_divisions_axis);
        dy = (field_size) / (number_of_divisions_axis);
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
                    UN[n][i][j].value = 0
                }
            }
        }

        ro_x = Number(coef_v_x_input.value) ? (Number(coef_v_x_input.value) + Math.abs(Number(coef_v_x_input.value))) / (2 * Math.abs(Number(coef_v_x_input.value))) : 0;
        ro_y = Number(coef_v_y_input.value) ? (Number(coef_v_y_input.value) + Math.abs(Number(coef_v_y_input.value))) / (2 * Math.abs(Number(coef_v_y_input.value))) : 0;
        //set initial conditional

        UN[0][num_x_input.value][num_y_input.value].value = parseFloat(coef_m_input.value) / cell_area
        set_earth([
            {x: 15, y: 20},
            {x: 16, y: 20},
            {x: 17, y: 20},
            {x: 18, y: 20},
            {x: 19, y: 20},
            {x: 20, y: 20},
            {x: 21, y: 20},
            {x: 22, y: 20},
            {x: 23, y: 20},
            {x: 24, y: 20},
            {x: 25, y: 20},
            {x: 26, y: 20},
            {x: 27, y: 20},
            {x: 28, y: 20},
            {x: 14, y: 20},
            {x: 13, y: 20},
            {x: 12, y: 20},
            {x: 11, y: 20},
            {x: 10, y: 20},
            {x: 9, y: 20},
            {x: 8, y: 20},
            {x: 7, y: 20},
            {x: 6, y: 20},
            {x: 5, y: 20},
            {x: 4, y: 20},
            {x: 3, y: 20},
            {x: 2, y: 20},
            {x: 1, y: 20},
        ])
        clearAll()

        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        //start draw and put to the draw func n (it's time moment)
        for (let time_step = 0; time_step < number_of_time_steps - 1; time_step++) {
            setTimeout(() => {
                ctx.clearRect(0, 0, ctxWidth, ctxHeight);
                calculate(time_step)
                draw_field(time_step)
                //draw_field_with_numbers(time_step)
            }, coef_t_input.value * time_step)
        }
    }

    const add_event_btn = () => {
        start_btn.addEventListener('click', initialize)
    }

    add_event_btn()
}
