import Cell from "./cell.js";
import Mauritius  from "./mauritius.js";

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
const scroll_to_element = document.querySelector('.model_title')
const cord_btn = document.getElementById('coordinates_button');

const btn_scroll = document.getElementById('scroll_btn')

const anim_time_info = document.getElementById("anim_time_info")
const square_common = document.getElementById("square_common")
const square_value = document.getElementById("square_value")

const first_value_sidebar = document.getElementById("first_value_sidebar")
const second_value_sidebar = document.getElementById("second_value_sidebar")
const third_value_sidebar = document.getElementById("third_value_sidebar")
const fourth_value_sidebar = document.getElementById("fourth_value_sidebar")

//const draw_btn = document.getElementById('draw_btn');
const ctx = canvas.getContext('2d')

const ctxWidth = 550;
const ctxHeight = 550;

btn_scroll.addEventListener('click', () => {
    // window.scroll({ top: 100px, behavior: 'smooth' })
    scroll_to_element.scrollIntoView({behavior: 'smooth'})
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
    let x_1 = 8;
    let t_0 = 0;
    let t_finish = 24 * 60 * 60;

    //const
    let T = 23;
    let D
    let m = 1000;
    let v_x = -0.08;
    let v_y = -0.08;

    //table parameters
    let field_size = x_1 - x_0
    let number_of_divisions_axis = 60;
    let number_of_time_steps = 140;
    let cell_area
    let dx = field_size / number_of_divisions_axis
    let dy = field_size / number_of_divisions_axis
    let dt = (t_finish - t_0) / (number_of_time_steps - 1);
    let fps = 100;

    let position_of_start_point_x = 37
    let position_of_start_point_y = 51
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
    const add_event_input = (name_input, name) => name_input.value = name

    const init_vars = () => {
        add_event_input(coef_m_input, m);
        add_event_input(anim_time, t_finish / 3600);
        add_event_input(field_size_input, field_size);
        add_event_input(coef_Temp_input, T);
        add_event_input(coef_t_input, fps);
        add_event_input(coef_v_x_input, v_x);
        add_event_input(coef_v_y_input, v_y);
        add_event_input(num_x_input, position_of_start_point_x);
        add_event_input(num_y_input, position_of_start_point_y);
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
        handle_change(num_x_input, position_of_start_point_x);
        handle_change(num_y_input, position_of_start_point_y);
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

    const format_number = (number) => {
        return number.toExponential(3)
    }

    const draw_field = (time_step) => {
        find_polluted_cells(time_step)
        draw_polluted_cells()
        let max_concentration = find_max_concentration(time_step);

        first_value_sidebar.innerText = format_number(max_concentration) + ' kg/m^2'
        second_value_sidebar.innerText = format_number(max_concentration / 350 * 3) + ' kg/m^2'
        third_value_sidebar.innerText = format_number(max_concentration / 350 * 2) + ' kg/m^2'
        fourth_value_sidebar.innerText = format_number(max_concentration / 350) + ' kg/m^2'

        for (let j = 0; j < number_of_divisions_axis; j++) {
            for (let i = 0; i < number_of_divisions_axis; i++) {
                ctx.beginPath();
                let concentration = UN[time_step][i][j].value ? parseFloat(UN[time_step][i][j].value) : 0;
                let proportion = concentration / max_concentration;
                //let color = concentration !== 0 ? percentToColor(proportion) : "rgb(0, 0, 255)";
                let color = proportion > 0.05  ? percentToColor(proportion) : "rgba(0, 0, 255,0)";

                if (UN[time_step][i][j].is_earth){
                    color = "transparent"
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

            draw_border(polluted_cells,cell)

            draw_color(cell,"rgba(26,36,73,0.1)",'fill')
        }
    }

    const draw_color = (cell, color, mode) => {
        ctx.beginPath();
        ctx.fillStyle = color;

        if (mode === 'fill') {
            ctx.fillRect(cell.x * cell_width, cell.y * cell_height, cell_width, cell_height)
        }
        else {
            ctx.beginPath();
            ctx.moveTo(cell.x * cell_width, cell.y * cell_height)
            ctx.lineTo(cell.x * cell_width + cell_width, cell.y * cell_height + cell_height)
            ctx.strokeStyle = color
            ctx.stroke();
        }

        ctx.closePath();
    }

    const draw_border = (polluted_cells, cell) => {

        let x = cell.x;
        let y = cell.y;


        if (!polluted_cells.some(c => c.x === x + 1 && c.y === y)){
            draw_color(cell, 'red','stroke' )
        } else if (!polluted_cells.some(c => c.x === x - 1 && c.y === y)) {
            draw_color(cell, 'red','stroke' )
        } else if (!polluted_cells.some(c => c.x === x  && c.y === y + 1)) {
            draw_color(cell, 'red','stroke' )
        } else if (!polluted_cells.some(c => c.x === x  && c.y === y - 1)) {
            draw_color(cell, 'red','stroke' )
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

    let coordinates = []
    const choose_cells_coordinate = () => {
        canvas.addEventListener('click', (e) => {
            const canvas_position = canvas.getBoundingClientRect();
            let x = e.clientX - canvas_position.left
            let y = e.clientY- canvas_position.top

            let x_cord = (x / cell_width).toFixed(0)
            let y_cord = (y / cell_height).toFixed(0)

            coordinates.push({
                x: x_cord,
                y: y_cord
            })
            ctx.beginPath();
            ctx.fillStyle = 'transparent';
            ctx.fillRect(x_cord * cell_width, y_cord * cell_height, cell_width, cell_height);
        })

    }
    choose_cells_coordinate()

    const draw_earth = (list) => {
        list.map(item => {
            ctx.beginPath();
            ctx.fillStyle = 'transparents';
            ctx.fillRect(item.x * cell_width, item.y * cell_height, cell_width, cell_height);
        })
    }

    //draw_earth(Mauritius)

    const set_earth = (list) => {
        for (let n = 0; n < number_of_time_steps; n++) {
            for (let index = 0; index < list.length; index++){
                UN[n][Number(list[index].x)][Number(list[index].y)].is_earth = true;
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
        set_earth(Mauritius)
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
        //cord_btn.addEventListener('click', () => console.log(JSON.stringify(coordinates)))
    }

    add_event_btn()
}


