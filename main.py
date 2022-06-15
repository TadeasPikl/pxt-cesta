offset1 = 0
offset2 = 19
offset3 = 8
offset4 = 16.5

servo1 = PCAmotor.Servos.S1 #FL
servo2 = PCAmotor.Servos.S2 #FR
servo3 = PCAmotor.Servos.S3 #BL
servo4 = PCAmotor.Servos.S4 #BR

# calibrated speed in cm/ms, °/ms
speed = 0.024
rotate_right_speed = 0.125
rotate_left_speed = 0.142

# center point of the car starts at: 0, 0; rotation: 0°
X = 0
Y = 0
rotation = 0

currentZ = [0, 0]


def on_forever():
    pass
basic.forever(on_forever)

def on_button_pressed_a():
    parse("L 12 25")
input.on_button_pressed(Button.A, on_button_pressed_a)

def forward(distance:int):
    PCAmotor.servo(servo1, 180 - offset1)
    PCAmotor.servo(servo2, 0 + offset2)
    PCAmotor.servo(servo4, 0 + offset4)
    PCAmotor.servo(servo3, 180 - offset3)
    basic.pause(distance / speed)
    PCAmotor.servo(servo1, 90)
    PCAmotor.servo(servo2, 90)
    PCAmotor.servo(servo4, 90)
    PCAmotor.servo(servo3, 90)

def rotate_right(degrees:int):
    global rotation
    PCAmotor.servo(servo1, 180 - offset1)
    PCAmotor.servo(servo2, 180 - offset2)
    PCAmotor.servo(servo4, 180 - offset4)
    PCAmotor.servo(servo3, 180 - offset3)
    basic.pause(degrees / rotate_right_speed)
    PCAmotor.servo(servo1, 90)
    PCAmotor.servo(servo2, 90)
    PCAmotor.servo(servo4, 90)
    PCAmotor.servo(servo3, 90)
    if rotation + degrees > 360:
        rotation += degrees - 360
    else:
        rotation += degrees

def rotate_left(degrees2:int):
    global rotation
    PCAmotor.servo(servo1, 0 + offset1)
    PCAmotor.servo(servo2, 0 + offset2)
    PCAmotor.servo(servo4, 0 + offset4)
    PCAmotor.servo(servo3, 0 + offset3)
    basic.pause(degrees2 / rotate_left_speed)
    PCAmotor.servo(servo1, 90)
    PCAmotor.servo(servo2, 90)
    PCAmotor.servo(servo4, 90)
    PCAmotor.servo(servo3, 90)
    if rotation - degrees2 <= 0:
        rotation -= degrees2 - 360
    else:
        rotation -= degrees2

def rotate_towards(angle:int):
    if abs(rotation - angle) < 180:
        if angle > rotation:
            rotate_right(abs(rotation - angle))
        else:
            rotate_left(abs(rotation - angle))
    elif angle < rotation:
        rotate_right(360 - abs(rotation - angle))
    else:
        rotate_left(360 - abs(rotation - angle))

def M(x:int, y:int):
    global X, Y
    dy = y - Y
    dx = x - X
    theta = Math.atan2(dx, dy)
    theta *= 180 / Math.PI
    if theta < 0:
        theta += 360
    rotate_towards(theta)
    forward(Math.sqrt((x - X) ** 2 + (y - Y) ** 2))
    X = x
    Y = y
    if currentZ2 == [0, 0]:
        currentZ2 = [X, Y]

def next(command: str, par1:int = None, par2:int = None):
    if command == "M" or command == "L":
        M(par1, par2)
    elif command == "m" or command == "l":
        M(par1 + X, par2 + Y)
    elif command == "Z" or command == "z":
        M(currentZ[0], currentZ[1])
    elif command == "H":
        M(par1, Y)
    elif command == "h":
        M(par1 + X, Y)
    elif command == "V":
        M(X, par1)
    elif command == "v":
        M(X, par1 + Y)
    elif command == "reset":
        X = 0
        Y = 0
        rotation = 0

    else:
        control.fail("undefined command")

def parse(commands: str):
    list1 = my_split(commands)
    list2 = []
    for i in range(len(list1)):
        if not isdigit(list1[i]):
            if isdigit(list1[i + 1]):
                if isdigit(list1[i + 2]):
                    list2.append([list1[i], list1[i + 1], list1[i + 2]])
                else:
                    list2.append([list1[i], list1[i + 1], None])
            else:
                list2.append([list1[i], None, None])

    for k in list2:
        next(k[0], int(k[1]), int(k[2]))

# makecode doesn't have type()
def isdigit(value: str):
    x = int(value)
    if is_na_n(x):
        return False
    return True

def on_uart_data_received():
    received = bluetooth.uart_read_until(serial.delimiters(Delimiters.NEW_LINE))
    basic.show_icon(IconNames.HAPPY)
    parse(received[:-1])
    basic.clear_screen()


# split() doesn't work in makecode https://github.com/microsoft/pxt/issues/8752
def my_split(string:str):
    split_value = []
    tmp = ''
    for c in string:
        if c == ' ':
            split_value.append(tmp)
            tmp = ''
        else:
            tmp += c
    if tmp:
        split_value.append(tmp)

    return split_value

bluetooth.start_uart_service()
PCAmotor.motor_stop_all()
basic.clear_screen()

bluetooth.on_uart_data_received(serial.delimiters(Delimiters.NEW_LINE), on_uart_data_received)