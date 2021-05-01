import { GameScene } from "./gameScene";

export default class Menu extends Phaser.Scene {
    
    element:any;
    constructor() {
        super('Menu');
    }

    preload() {    
        this.load.html('connectionMenu', 'assets/DOMUI/ConnectionMenu.html');
        this.load.html('hostMenu', 'assets/DOMUI/Host.html');
        this.load.html('joinMenu', 'assets/DOMUI/Join.html');

    }

    create() {
        this.scene.launch("GameScene");
        (this.scene.get('GameScene')).events.on('create', ()=>{
                    (<GameScene>this.scene.get('GameScene')).setup(false);
                    this.element = this.add.dom(400, 400).createFromCache('connectionMenu');
                    this.element.addListener('click');
            
                    this.element.on('click',  (event) => {
                
                        this.element.setVisible(false);
                        if (event.target.id === 'Host')
                        {
                             var element2 = this.add.dom(400, 400).createFromCache('hostMenu');
            
                            var ID = element2.getChildByProperty('id','GameID');
                            ID.innerHTML = "012345678";
                        }
                        else if(event.target.id === 'Connect')
                        {
                            this.element = this.add.dom(400, 400).createFromCache('joinMenu');
                        }
                        else if(event.target.id === 'SinglePlayer')
                        {
                            this.tweens.add({
                                targets: this,
                                NOTHING: { value: 0, duration: 50 },
                                onComplete: () => { (<GameScene>this.scene.get('GameScene')).setup(true); } });
                
                            }
            
                        }
                
                    );

                    } );
       

    }

    makeVisible()
    {
        this.element.setVisible(true);
    }


    update(time, delta) {

    }






}
export {Menu}