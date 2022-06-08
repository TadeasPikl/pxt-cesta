offset1 = 0
offset2 = 19
offset3 = 8
offset4 = 16.5

servo1 = magicbit.Servos.S1 #FL
servo2 = magicbit.Servos.S2 #FR
servo3 = magicbit.Servos.S3 #BL
servo4 = magicbit.Servos.S4 #BR

#calibrated speed in cm/ms, °/ms
speed = 0.024
rotate_right_speed = 0.125
rotate_left_speed = 0.142

#center point of the car starts at: 0, 0; rotation: 0°
X = 0
Y = 0
rotation = 0

currentZ = [0,0]

def on_forever():
    pass
basic.forever(on_forever)


def on_button_pressed_a():
    next("M", 12.247422, 17.010309)
    next("M", 204.80413, 6.4639169)
    next("M", 180.30928, 178.94845)
    next("H", 14.628865)
    next("L", 172.65464, 88.963916)
    next("Z")
input.on_button_pressed(Button.A, on_button_pressed_a)


def forward(distance):
    global speed
    magicbit.servo(servo1, 180-offset1)
    magicbit.servo(servo2, 0+offset2)
    magicbit.servo(servo4, 0+offset4)
    magicbit.servo(servo3, 180-offset3)
    basic.pause(distance/speed)
    magicbit.servo(servo1, 90)
    magicbit.servo(servo2, 90)
    magicbit.servo(servo4, 90)
    magicbit.servo(servo3, 90)
        
def rotate_right(degrees):
    global rotation, rotate_right_speed
    magicbit.servo(servo1, 180-offset1)
    magicbit.servo(servo2, 180-offset2)
    magicbit.servo(servo4, 180-offset4)
    magicbit.servo(servo3, 180-offset3)
    basic.pause(degrees/rotate_right_speed)
    magicbit.servo(servo1, 90)
    magicbit.servo(servo2, 90)
    magicbit.servo(servo4, 90)
    magicbit.servo(servo3, 90)
    if rotation + degrees > 360:
        rotation += degrees - 360
    else:
        rotation += degrees


def rotate_left(degrees):
    global rotation, rotate_left_speed
    magicbit.servo(servo1, 0+offset1)
    magicbit.servo(servo2, 0+offset2)
    magicbit.servo(servo4, 0+offset4)
    magicbit.servo(servo3, 0+offset3)
    basic.pause(degrees/rotate_left_speed)
    magicbit.servo(servo1, 90)
    magicbit.servo(servo2, 90)
    magicbit.servo(servo4, 90)
    magicbit.servo(servo3, 90)
    if rotation - degrees <= 0:
        rotation -= degrees - 360
    else:
        rotation -= degrees

def rotate_towards(angle):
    global rotation
    if abs(rotation - angle) < 180:
        if angle > rotation:
            rotate_right(abs(rotation - angle))
        else:
            rotate_left(abs(rotation - angle))
    else:
        if angle < rotation:
            rotate_right(360 - abs(rotation - angle))
        else:
            rotate_left(360 - abs(rotation - angle))
    

def M(x,y):
    global X,Y,rotation
    dy = y - Y
    dx = x - X
    theta = Math.atan2(dx,dy)
    theta *= 180/Math.PI
    if (theta < 0): theta += 360

    rotate_towards(theta)
    forward(Math.sqrt((x-X)**2 + (y-Y)**2))
    X = x
    Y = y
    if currentZ == [0,0]:
        currentZ = [X,Y]



def next(command,par1=None,par2=None):
    global X,Y,currentZ
    if command == "M" or command == "L":
        M(par1,par2)
    elif command == "m" or command == "l":
        M(par1+X,par2+Y)
    elif command == "Z":
        M(currentZ[0],currentZ[1])
    elif command == "H":
        M(par1,Y)
    elif command == "h":
        M(par1+X,Y)
    elif command == "V":
        M(X,par1)
    elif command == "v":
        M(X,par1+Y)

    else:
        raise Exception("undefined command")



magicbit.motor_stop_all()