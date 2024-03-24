import { _decorator, Component, input, Input, EventTouch, Node, Vec3, lerp, tween, Animation, AnimationState, SpriteFrame, Sprite, Label } from 'cc';
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
    hand: Node;
    @property(Node)
    glass: Node;
    @property(Animation)
    animation: Animation;

    ///Fill
    @property([SpriteFrame])
    glassFrames: SpriteFrame[] = [];
    //////
    @property(Node)
    handlerObj: Node = null;
    minRotation: number = 60;
    maxRotation: number = -60;
    /////
    @property(Animation)
    feedbackAnim: Animation = null;
    @property(SpriteFrame)
    goodFrame: SpriteFrame;
    @property(SpriteFrame)
    perfectFrame: SpriteFrame;
    @property(SpriteFrame)
    missFrame: SpriteFrame;
    ////
    @property(Label)
    scoreLabel: Label;

    maxMl: number = 350;
    pieceOfMl: number;
    currentMl: number = 0;
    speedFill: number = 0;
    totalMl: number = 0;

    //////
    spriteId: number;
    startPositionY: number;
    maxSwipeHeight = 400;
    speedResetHandler: number = 1;
    isNeedResetHandler: boolean = false;
    isGameOver: boolean = false;
    isMovingIn: boolean = true;
    isMovingOut: boolean = true;

    start() {
        this.animation.on(Animation.EventType.FINISHED, this.onAnimationEvent, this)
        this.pieceOfMl = this.maxMl / this.glassFrames.length;
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

            if (this.handlerObj.angle <= this.minRotation) {
                this.isNeedResetHandler = false;
                this.handlerObj.angle = this.minRotation;
            }
        }
        else {
            this.currentMl += this.pieceOfMl * this.speedFill*2;
            let frameId = Math.round(lerp(0, this.glassFrames.length, this.currentMl/this.maxMl));
            this.SetGlassSprite(frameId);
        }
    }

    Reset() {
        this.handlerObj.angle = this.minRotation;
        this.isNeedResetHandler = false;
        this.gameOver.active = false;
        this.hand.active = false;
        this.isGameOver = false;
        this.feedbackAnim.node.active = false;
        this.SetGlassSprite(0);

        this.speedFill = 0;
        this.currentMl = 0;
        this.totalMl = 0;
        this.spriteId = 0;
        this.SetTotalScore();
    }

    private StartGame() {
        this.Reset();
        this.timer.StartCount(this.timeInOneRound, this.OnGameOver);
        this.OnMoveGlassIn();
    }

    OnRestartButton() {
        this.StartGame();
    }

    OnGameOver() {
        this.gameOver.active = true;
        this.isGameOver = true;
    }

    OnMoveGlassIn() {
        this.animation.play('glassMoveIn');
        this.SetGlassSprite(0);
        this.isMovingIn = true;
        this.currentMl = 0;
        this.speedFill = 0;
    }

    OnMoveGlassOut() {
        this.animation.play('glassMoveOut');
        if (this.isMovingOut) {
            this.spriteId = 0;
        }
        this.ShowFeedback();
        this.isMovingOut = true;
    }

    onAnimationEvent(type: Animation.EventType, state: AnimationState) {
        if (this.isGameOver) return;
        if (state.clip.name == "glassMoveOut") {
            this.OnMoveGlassIn();
            this.isMovingOut = false;
        }
        else if (state.clip.name == "glassMoveIn") {
            this.isMovingIn = false;
        }
    }

    SetGlassSprite(index: number) {
        if (index < this.glassFrames.length) {
            this.glass.getComponent(Sprite).spriteFrame = this.glassFrames[index];
        }
        this.spriteId = index;
    }

    ShowFeedback() {
        let percent = this.spriteId / this.glassFrames.length;
        let frame = this.missFrame;
        if (percent > 1)
        {

        }
        else if (percent > 0.9) {
            frame = this.perfectFrame;
            this.SetTotalScore();
        }
        else if (percent > 0.7) {
            frame = this.goodFrame;
            this.SetTotalScore();
        }
        this.feedbackAnim.node.active = true;
        this.feedbackAnim.getComponentInChildren(Sprite).spriteFrame = frame;
        this.feedbackAnim.play();
    }

    SetTotalScore()
    {
        this.totalMl += Math.round((this.spriteId / this.glassFrames.length)* this.maxMl)
        this.scoreLabel.string = this.totalMl +'';
    }

    //////////////////---Input---////////////////////

    onTouchStart(event: EventTouch) {
        if (this.isGameOver) return;
        this.isNeedResetHandler = false;
        this.speedFill = 0;
        this.startPositionY = event.getLocationY();
    }

    onTouchEnd(event: EventTouch) {
        if (this.isGameOver) return;
        this.isNeedResetHandler = true;
        this.speedFill = 0;
        this.OnMoveGlassOut();
    }

    onTouchMove(event: EventTouch) {
        if (this.isGameOver) return;
        if (event.getLocationY() < this.startPositionY) {
            let ratio = Math.min(Math.abs(event.getLocationY() - this.startPositionY), this.maxSwipeHeight) / this.maxSwipeHeight;
            let eulerZ = lerp(this.minRotation, this.maxRotation, ratio);
            this.handlerObj.angle = eulerZ;

            if (!this.isMovingIn) {
                this.speedFill = ratio;
            }
        }
    }
}


