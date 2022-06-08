let offset1 = 0
let offset2 = 19
let offset3 = 8
let offset4 = 16.5
let servo1 = magicbit.Servos.S1
// FL
let servo2 = magicbit.Servos.S2
// FR
let servo3 = magicbit.Servos.S3
// BL
let servo4 = magicbit.Servos.S4
// BR
// calibrated speed in cm/ms, °/ms
let speed = 0.024
let rotate_right_speed = 0.125
let rotate_left_speed = 0.142
// center point of the car starts at: 0, 0; rotation: 0°
let X = 0
let Y = 0
let rotation = 0
let currentZ = [0, 0]
basic.forever(function on_forever() {
    
})
input.onButtonPressed(Button.A, function on_button_pressed_a() {
    next("M", 12.247422, 17.010309)
    next("M", 204.80413, 6.4639169)
    next("M", 180.30928, 178.94845)
    next("H", 14.628865)
    next("L", 172.65464, 88.963916)
    next("Z")
})
function forward(distance: number) {
    
    magicbit.Servo(servo1, 180 - offset1)
    magicbit.Servo(servo2, 0 + offset2)
    magicbit.Servo(servo4, 0 + offset4)
    magicbit.Servo(servo3, 180 - offset3)
    basic.pause(distance / speed)
    magicbit.Servo(servo1, 90)
    magicbit.Servo(servo2, 90)
    magicbit.Servo(servo4, 90)
    magicbit.Servo(servo3, 90)
}

function rotate_right(degrees: number) {
    
    magicbit.Servo(servo1, 180 - offset1)
    magicbit.Servo(servo2, 180 - offset2)
    magicbit.Servo(servo4, 180 - offset4)
    magicbit.Servo(servo3, 180 - offset3)
    basic.pause(degrees / rotate_right_speed)
    magicbit.Servo(servo1, 90)
    magicbit.Servo(servo2, 90)
    magicbit.Servo(servo4, 90)
    magicbit.Servo(servo3, 90)
    if (rotation + degrees > 360) {
        rotation += degrees - 360
    } else {
        rotation += degrees
    }
    
}

function rotate_left(degrees: number) {
    
    magicbit.Servo(servo1, 0 + offset1)
    magicbit.Servo(servo2, 0 + offset2)
    magicbit.Servo(servo4, 0 + offset4)
    magicbit.Servo(servo3, 0 + offset3)
    basic.pause(degrees / rotate_left_speed)
    magicbit.Servo(servo1, 90)
    magicbit.Servo(servo2, 90)
    magicbit.Servo(servo4, 90)
    magicbit.Servo(servo3, 90)
    if (rotation - degrees <= 0) {
        rotation -= degrees - 360
    } else {
        rotation -= degrees
    }
    
}

function rotate_towards(angle: number) {
    
    if (Math.abs(rotation - angle) < 180) {
        if (angle > rotation) {
            rotate_right(Math.abs(rotation - angle))
        } else {
            rotate_left(Math.abs(rotation - angle))
        }
        
    } else if (angle < rotation) {
        rotate_right(360 - Math.abs(rotation - angle))
    } else {
        rotate_left(360 - Math.abs(rotation - angle))
    }
    
}

function M(x: number, y: number) {
    let currentZ: number[];
    
    let dy = y - Y
    let dx = x - X
    let theta = Math.atan2(dx, dy)
    theta *= 180 / Math.PI
    if (theta < 0) {
        theta += 360
    }
    
    rotate_towards(theta)
    forward(Math.sqrt((x - X) ** 2 + (y - Y) ** 2))
    X = x
    Y = y
    if (currentZ == [0, 0]) {
        currentZ = [X, Y]
    }
    
}

function next(command: string, par1: number = null, par2: number = null) {
    
    if (command == "M" || command == "L") {
        M(par1, par2)
    } else if (command == "m" || command == "l") {
        M(par1 + X, par2 + Y)
    } else if (command == "Z") {
        M(currentZ[0], currentZ[1])
    } else if (command == "H") {
        M(par1, Y)
    } else if (command == "h") {
        M(par1 + X, Y)
    } else if (command == "V") {
        M(X, par1)
    } else if (command == "v") {
        M(X, par1 + Y)
    } else {
        control.fail("undefined command")
    }
    
}

magicbit.MotorStopAll()
