let offset1 = 0
let offset2 = 19
let offset3 = 8
let offset4 = 16.5
let servo1 = PCAmotor.Servos.S1
// FL
let servo2 = PCAmotor.Servos.S2
// FR
let servo3 = PCAmotor.Servos.S3
// BL
let servo4 = PCAmotor.Servos.S4
// BR
//  calibrated speed in cm/ms, °/ms
let speed = 0.024
let rotate_right_speed = 0.125
let rotate_left_speed = 0.142
//  center point of the car starts at: 0, 0; rotation: 0°
let X = 0
let Y = 0
let rotation = 0
let currentZ = [0, 0]
basic.forever(function on_forever() {
    
})
function forward(distance: number) {
    PCAmotor.Servo(servo1, 180 - offset1)
    PCAmotor.Servo(servo2, 0 + offset2)
    PCAmotor.Servo(servo4, 0 + offset4)
    PCAmotor.Servo(servo3, 180 - offset3)
    basic.pause(distance / speed)
    PCAmotor.Servo(servo1, 90)
    PCAmotor.Servo(servo2, 90)
    PCAmotor.Servo(servo4, 90)
    PCAmotor.Servo(servo3, 90)
}

function rotate_right(degrees: number) {
    
    PCAmotor.Servo(servo1, 180 - offset1)
    PCAmotor.Servo(servo2, 180 - offset2)
    PCAmotor.Servo(servo4, 180 - offset4)
    PCAmotor.Servo(servo3, 180 - offset3)
    basic.pause(degrees / rotate_right_speed)
    PCAmotor.Servo(servo1, 90)
    PCAmotor.Servo(servo2, 90)
    PCAmotor.Servo(servo4, 90)
    PCAmotor.Servo(servo3, 90)
    if (rotation + degrees > 360) {
        rotation += degrees - 360
    } else {
        rotation += degrees
    }
    
}

function rotate_left(degrees2: number) {
    
    PCAmotor.Servo(servo1, 0 + offset1)
    PCAmotor.Servo(servo2, 0 + offset2)
    PCAmotor.Servo(servo4, 0 + offset4)
    PCAmotor.Servo(servo3, 0 + offset3)
    basic.pause(degrees2 / rotate_left_speed)
    PCAmotor.Servo(servo1, 90)
    PCAmotor.Servo(servo2, 90)
    PCAmotor.Servo(servo4, 90)
    PCAmotor.Servo(servo3, 90)
    if (rotation - degrees2 <= 0) {
        rotation -= degrees2 - 360
    } else {
        rotation -= degrees2
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
    let currentZ2: number[];
    
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
    if (currentZ2 == [0, 0]) {
        currentZ2 = [X, Y]
    }
    
}

function next(command: string, par1: number = null, par2: number = null) {
    let X: number;
    let Y: number;
    let rotation: number;
    if (command == "M" || command == "L") {
        M(par1, par2)
    } else if (command == "m" || command == "l") {
        M(par1 + X, par2 + Y)
    } else if (command == "Z" || command == "z") {
        M(currentZ[0], currentZ[1])
    } else if (command == "H") {
        M(par1, Y)
    } else if (command == "h") {
        M(par1 + X, Y)
    } else if (command == "V") {
        M(X, par1)
    } else if (command == "v") {
        M(X, par1 + Y)
    } else if (command == "reset") {
        X = 0
        Y = 0
        rotation = 0
    } else {
        control.fail("undefined command")
    }
    
}

function parse(commands: string) {
    let list1 = my_split(commands)
    let list2 = []
    for (let i = 0; i < list1.length; i++) {
        if (!isdigit(list1[i])) {
            if (isdigit(list1[i + 1])) {
                if (isdigit(list1[i + 2])) {
                    list2.push([list1[i], list1[i + 1], list1[i + 2]])
                } else {
                    list2.push([list1[i], list1[i + 1], null])
                }
                
            } else {
                list2.push([list1[i], null, null])
            }
            
        }
        
    }
    for (let k of list2) {
        next(k[0], parseInt(k[1]), parseInt(k[2]))
    }
}

//  makecode doesn't have type()
function isdigit(value: string): boolean {
    let x = parseInt(value)
    if (isNaN(x)) {
        return false
    }
    
    return true
}

//  split() doesn't work in makecode https://github.com/microsoft/pxt/issues/8752
function my_split(string: string): string[] {
    let split_value = []
    let tmp = ""
    for (let c of string) {
        if (c == " ") {
            split_value.push(tmp)
            tmp = ""
        } else {
            tmp += c
        }
        
    }
    if (tmp) {
        split_value.push(tmp)
    }
    
    return split_value
}

bluetooth.startUartService()
PCAmotor.MotorStopAll()
basic.clearScreen()
bluetooth.onUartDataReceived(serial.delimiters(Delimiters.NewLine), function on_uart_data_received() {
    let received = bluetooth.uartReadUntil(serial.delimiters(Delimiters.NewLine))
    basic.showIcon(IconNames.Happy)
    parse(received.slice(0, -1))
    basic.clearScreen()
})
