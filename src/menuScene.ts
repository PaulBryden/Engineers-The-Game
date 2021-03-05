
export default class Menu extends Phaser.Scene {
    
    constructor() {
        super('Menu');
    }

    preload() {    
        this.load.html('connectionMenu', 'assets/DOMUI/ConnectionMenu.html');
        this.load.html('hostMenu', 'assets/DOMUI/Host.html');
        this.load.html('joinMenu', 'assets/DOMUI/Join.html');


    }

    create() {
        var element = this.add.dom(400, 400).createFromCache('connectionMenu');
        element.addListener('click');

        element.on('click',  (event) => {
    
            element.destroy();
            if (event.target.id === 'Host')
            {
                 var element2 = this.add.dom(400, 400).createFromCache('hostMenu');

                var ID = element2.getChildByProperty('id','GameID');
                ID.innerHTML = "012345678";
            }
            else if(event.target.id === 'Connect')
            {
                element = this.add.dom(400, 400).createFromCache('joinMenu');
            }
            else if(event.target.id === 'SinglePlayer')
            {
                this.scene.start('GameScene');

            }
    
        });

    }


    update(time, delta) {

    }






}
export {Menu}