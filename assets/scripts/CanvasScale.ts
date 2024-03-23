import { _decorator, Canvas, Component, Node, UITransform } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CanvasScale')
export class CanvasScale extends Component {
    canvas: UITransform;
    protected onLoad(): void {
        this.canvas = this.node.getComponent(UITransform);
        this.setCanvas();
        window.onresize = ()=>{
            this.setCanvas();
        }
    }

    setCanvas()
    {
        

    }
}


