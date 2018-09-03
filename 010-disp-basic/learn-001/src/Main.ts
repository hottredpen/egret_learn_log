class Main extends eui.UILayer{

    private textfield:egret.TextField;

    protected createChildren():void{
        super.createChildren();
        egret.lifecycle.addLifecycleListener((context)=>{
            // custom lifecycle plugin
        })

        egret.lifecycle.onPause = () => {
            egret.ticker.pause();
        }

        egret.lifecycle.onResume = ()=>{
            egret.ticker.resume();
        }

        // 注入自定义的素材解析器
        let assetAdapter = new AssetAdapter();
        egret.registerImplementation('eui.IAssetAdapter',assetAdapter);
        egret.registerImplementation('eui.IThemeAdapter',new ThemeAdapter());

        this.runGame().catch(e=>{
            console.log(e);
        });

    }

    private async runGame(){
        await this.loadResource()
        this.createGameSence();
        const result = await RES.getResAsync('description_json')
        this.startAnimation(result);
        await platform.login();
        const userInfo = await platform.getUserInfo();
        console.log(userInfo)
    }

    private async loadResource(){
        try{
            const loadingView = new LoadingUI();
            this.stage.addChild(loadingView);
            await RES.loadConfig('resource/default.res.json','resource/');
            await this.loadTheme();
            await RES.loadGroup('preload',0,loadingView);
            this.stage.removeChild(loadingView)
        }
        catch(e){
            console.log(e)
        }

    }

    private async loadTheme(){
        return new Promise((resolve,reject)=>{
            let theme = new eui.Theme('resource/default.thm.json',this.stage);
            theme.addEventListener(eui.UIEvent.COMPLETE,()=>{
                resolve();
            },this)
        })
    }

    protected createGameSence():void{
        let sky = this.createBitmapByName('bg_jpg');
        this.addChild(sky)
        let stageW = this.stage.stageWidth;
        let stageH = this.stage.stageHeight;
        sky.width = stageW;
        sky.height = stageH;

        let topMask = new egret.Shape();
        topMask.graphics.beginFill(0x000000,0.5);
        topMask.graphics.drawRect(0,0,stageW,172);
        topMask.graphics.endFill();
        topMask.y = 33;
        this.addChild(topMask);

        let icon:egret.Bitmap = this.createBitmapByName('egret_icon_png')
        this.addChild(icon);
        icon.x = 26;
        icon.y = 33;

        let line = new egret.Shape();
        line.graphics.lineStyle(2,0xffffff);
        line.graphics.moveTo(0,0)
        line.graphics.lineTo(0,117);
        line.graphics.endFill();
        line.x = 172;
        line.y = 61;
        this.addChild(line);

        let colorLable = new egret.TextField();
        colorLable.textColor = 0xffffff;
        colorLable.width = stageW - 172;
        colorLable.textAlign = 'center';
        colorLable.text = 'hello egret';
        colorLable.size = 24;
        colorLable.x = 172;
        colorLable.y = 80;
        this.addChild(colorLable)

        let textfield = new egret.TextField();
        this.addChild(textfield);
        textfield.alpha = 0;
        textfield.width = stageW - 172;
        textfield.textAlign = egret.HorizontalAlign.CENTER;
        textfield.size = 24;
        textfield.textColor = 0xffffff;
        textfield.x = 172;
        textfield.y = 135;
        this.textfield = textfield;

        let button = new eui.Button();
        button.label = 'Click';
        button.horizontalCenter = 0;
        button.verticalCenter = 0;
        this.addChild(button);
        button.addEventListener(egret.TouchEvent.TOUCH_TAP,this.onButtonClick,this)



    }

    private createBitmapByName(name: string):egret.Bitmap{
        let result = new egret.Bitmap();
        let texture:egret.Texture = RES.getRes(name);
        result.texture= texture;
        return result;

    }

    private onButtonClick(e:egret.TouchEvent){
        let panel = new eui.Panel();
        panel.title = 'Title';
        panel.horizontalCenter = 0;
        panel.verticalCenter = 0;
        this.addChild(panel);
    }

    private startAnimation(resule:Array<any>):void{
        let parser = new egret.HtmlTextParser();
        
        let textflowArr = resule.map(text=>parser.parse(text));
        let textfield = this.textfield;
        let count = -1;
        let change = ()=>{
            count++;
            if(count >= textflowArr.length){
                count = 0;
            }
            let textFlow = textflowArr[count];

            // 切换描述内容
            textfield.textFlow = textFlow;
            let tw = egret.Tween.get(textfield);
            tw.to({'alpha':1},200);
            tw.wait(2000);
            tw.to({'alpha':0},200);
            tw.call(change,this);

        }
    }


}
