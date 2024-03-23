import { _decorator, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Timer')
export class Timer extends Component {
    @property(Label)
    label: Label;
    timer: number = 60;
    isCounting: boolean = false;
    callback: {(): void;};
    StartCount(time: number, cb)
    {
        this.timer = time;
        this.isCounting = true;
        this.callback = cb;
    }

    StopCount()
    {
        this.isCounting = false;
    }

    update(deltaTime: number) {
        if (this.isCounting)
        {
            this.timer -= deltaTime;
            this.label.string = Math.max(0,Math.round(this.timer)) +'';
            if (this.timer <= 0)
            {
                this.callback();
            }
        }
    }
}


