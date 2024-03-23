import { _decorator, Component, input, Input, EventTouch, Node, Vec3, lerp, tween, Quat } from 'cc';
import { Timer } from './Timer';
const { ccclass, property } = _decorator;

@ccclass('GameController')
export class GameController extends Component {
    @property(Timer)
    timer: Timer;
    @property
    timeInOneRound: number = 60;
    @property(Node)
    gameOver: Node;

    @property(Node)
    handlerObj: Node = null;
    minRotation: number = 60;
    maxRotation: number = -60;
    startPositionY: number;
    speed: number = 0.1;
    maxSwipeHeight = 400;
    speedResetHandler: number = 1;
    isNeedResetHandler: boolean = false;
    start() {
        this.StartGame();
    }

    onLoad() {
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        input.on(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
    }

    onDestroy() {
        input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.off(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
    }

    protected update(dt: number): void {
        if (this.isNeedResetHandler) {
            if (this.handlerObj.angle > this.minRotation) {
                this.handlerObj.angle -= this.speedResetHandler * dt;
            }

            if (this.handlerObj.angle <= this.minRotation)
            {
                this.isNeedResetHandler = false;
                this.handlerObj.angle = this.minRotation;
            }
        }
    }

    Reset() {
        this.handlerObj.angle = this.minRotation;
        this.isNeedResetHandler = false;
        this.gameOver.active = false;
    }

    private StartGame()
    {
        this.Reset();
        this.timer.StartCount(this.timeInOneRound, this.OnGameOver);
    }

    OnRestartButton()
    {
        this.StartGame();
    }

    OnGameOver()
    {
        this.gameOver.active = true;
    }

    onTouchStart(event: EventTouch) {
        this.isNeedResetHandler = false; 
        this.startPositionY = event.getLocationY();
    }

    onTouchEnd(event: EventTouch) {
        this.isNeedResetHandler = true;
    }

    onTouchMove(event: EventTouch) {
        if (event.getLocationY() < this.startPositionY) {
            let eulerZ = lerp(this.handlerObj.angle, this.maxRotation, Math.abs(event.getLocationY() - this.startPositionY) / this.maxSwipeHeight);
            this.handlerObj.angle = eulerZ;
        }
    }
}


