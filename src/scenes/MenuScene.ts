import { GameScene } from './GameScene';

export default class Menu extends Phaser.Scene 
{
    
    element:any;
    copyrightNotice: any;
    creditsButton: any;
    versionNotice: any;
    constructor() 
    {
        super('Menu');
    }

    preload() 
    {    
        this.load.html('connectionMenu', 'assets/DOMUI/ConnectionMenu.html');
        this.load.html('hostMenu', 'assets/DOMUI/Host.html');
        this.load.html('joinMenu', 'assets/DOMUI/Join.html');

    }

    create() 
    {
        this.scene.launch('GameScene');
        (this.scene.get('GameScene')).events.on('create', ()=>
        {
            (<GameScene>this.scene.get('GameScene')).setup(false);
            this.versionNotice = this.add.dom(1550, 30).createFromHTML('<div id=\'copyrightNotice\'>V0.1.6</div>');
            this.copyrightNotice = this.add.dom(250, 880).createFromHTML('<div id=\'copyrightNotice\'>Copyright Paul Bryden 2021</div>');
            this.creditsButton = this.add.dom(1520,850).createFromHTML('<button type=\'button\' id=\'credits\' data-bs-toggle=\'modal\' data-bs-target=\'#creditsModal\' class=\'btn btn-outline-light btn-lg\'>Credits</button>');
            this.element = this.add.dom(400, 450).createFromCache('connectionMenu');
            this.element.addListener('click');
            
            this.element.on('click',  (event) => 
            {
                if(event.target.id === 'SinglePlayer') 
                {
                    this.tweens.add({
                        targets: this,
                        NOTHING: { value: 0, duration: 50 },
                        onComplete: () => 
                        {
                            (<GameScene>this.scene.get('GameScene')).setup(true); 
                            this.element.setVisible(false);
                            this.copyrightNotice.setVisible(false);
                            this.creditsButton.setVisible(false);
                            this.versionNotice.setVisible(false);
                        } });
                
                }
            }
                
            );

        } );
       

    }

    makeVisible() 
    {
        this.element.setVisible(true);
        this.copyrightNotice.setVisible(true);
        this.creditsButton.setVisible(true);
        this.versionNotice.setVisible(true);
    }


    update(time, delta) 
    {

    }






}
export {Menu};