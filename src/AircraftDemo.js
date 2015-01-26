var LoaderEvent = require("awayjs-core/lib/events/LoaderEvent");
var UVTransform = require("awayjs-core/lib/geom/UVTransform");
var Vector3D = require("awayjs-core/lib/geom/Vector3D");
var AssetLibrary = require("awayjs-core/lib/library/AssetLibrary");
var AssetType = require("awayjs-core/lib/library/AssetType");
var URLRequest = require("awayjs-core/lib/net/URLRequest");
var Debug = require("awayjs-core/lib/utils/Debug");
var RequestAnimationFrame = require("awayjs-core/lib/utils/RequestAnimationFrame");
var DisplayObjectContainer = require("awayjs-display/lib/containers/DisplayObjectContainer");
var View = require("awayjs-display/lib/containers/View");
var DirectionalLight = require("awayjs-display/lib/entities/DirectionalLight");
var Skybox = require("awayjs-display/lib/entities/Skybox");
var StaticLightPicker = require("awayjs-display/lib/materials/lightpickers/StaticLightPicker");
var PrimitivePlanePrefab = require("awayjs-display/lib/prefabs/PrimitivePlanePrefab");
var DefaultRenderer = require("awayjs-renderergl/lib/DefaultRenderer");
var MethodMaterial = require("awayjs-methodmaterials/lib/MethodMaterial");
var MethodRendererPool = require("awayjs-methodmaterials/lib/pool/MethodRendererPool");
var EffectEnvMapMethod = require("awayjs-methodmaterials/lib/methods/EffectEnvMapMethod");
var NormalSimpleWaterMethod = require("awayjs-methodmaterials/lib/methods/NormalSimpleWaterMethod");
var SpecularFresnelMethod = require("awayjs-methodmaterials/lib/methods/SpecularFresnelMethod");
var OBJParser = require("awayjs-parsers/lib/OBJParser");
var AircraftDemo = (function () {
    //}
    function AircraftDemo() {
        var _this = this;
        //{ state
        this._maxStates = 2;
        this._cameraIncrement = 0;
        this._rollIncrement = 0;
        this._loopIncrement = 0;
        this._state = 0;
        this._appTime = 0;
        this._seaInitialized = false;
        this._f14Initialized = false;
        this._skyboxInitialized = false;
        Debug.LOG_PI_ERRORS = false;
        Debug.THROW_ERRORS = false;
        this.initView();
        this.initLights();
        this.initAnimation();
        this.initParsers();
        this.loadAssets();
        window.onresize = function (event) { return _this.onResize(event); };
    }
    AircraftDemo.prototype.loadAssets = function () {
        this.loadAsset('assets/sea_normals.jpg');
        this.loadAsset('assets/f14/f14d.obj');
        this.loadAsset('assets/skybox/CubeTextureTest.cube');
    };
    AircraftDemo.prototype.loadAsset = function (path) {
        var _this = this;
        var token = AssetLibrary.load(new URLRequest(path));
        token.addEventListener(LoaderEvent.RESOURCE_COMPLETE, function (event) { return _this.onResourceComplete(event); });
    };
    AircraftDemo.prototype.initParsers = function () {
        AssetLibrary.enableParser(OBJParser);
    };
    AircraftDemo.prototype.initAnimation = function () {
        this._timer = new RequestAnimationFrame(this.render, this);
    };
    AircraftDemo.prototype.initView = function () {
        this._view = new View(new DefaultRenderer(MethodRendererPool));
        this._view.camera.z = -500;
        this._view.camera.y = 250;
        this._view.camera.rotationX = 20;
        this._view.camera.projection.near = 0.5;
        this._view.camera.projection.far = 14000;
        this._view.backgroundColor = 0x2c2c32;
        this.onResize();
    };
    AircraftDemo.prototype.initializeScene = function () {
        if (this._skyboxCubeTexture && this._f14Geom && this._seaNormalTexture) {
            this.initF14();
            this.initSea();
            this._timer.start();
        }
    };
    AircraftDemo.prototype.initLights = function () {
        var light = new DirectionalLight();
        light.color = 0x974523;
        light.direction = new Vector3D(-300, -300, -5000);
        light.ambient = 1;
        light.ambientColor = 0x7196ac;
        light.diffuse = 1.2;
        light.specular = 1.1;
        this._view.scene.addChild(light);
        this._lightPicker = new StaticLightPicker([light]);
    };
    AircraftDemo.prototype.initF14 = function () {
        var _this = this;
        this._f14Initialized = true;
        var f14Material = new MethodMaterial(this._seaNormalTexture, true, true, false); // will be the cubemap
        f14Material.lightPicker = this._lightPicker;
        this._view.scene.addChild(this._f14Geom);
        this._f14Geom.transform.scale = new Vector3D(20, 20, 20);
        this._f14Geom.rotationX = 90;
        this._f14Geom.y = 200;
        this._view.camera.lookAt(this._f14Geom.transform.position);
        document.onmousedown = function (event) { return _this.onMouseDown(event); };
    };
    AircraftDemo.prototype.initSea = function () {
        this._seaMaterial = new MethodMaterial(this._seaNormalTexture, true, true, false); // will be the cubemap
        this._waterMethod = new NormalSimpleWaterMethod(this._seaNormalTexture, this._seaNormalTexture);
        var fresnelMethod = new SpecularFresnelMethod();
        fresnelMethod.normalReflectance = .3;
        this._seaMaterial.alphaBlending = true;
        this._seaMaterial.lightPicker = this._lightPicker;
        this._seaMaterial.repeat = true;
        this._seaMaterial.animateUVs = true;
        this._seaMaterial.normalMethod = this._waterMethod;
        this._seaMaterial.addEffectMethod(new EffectEnvMapMethod(this._skyboxCubeTexture));
        this._seaMaterial.specularMethod = fresnelMethod;
        this._seaMaterial.gloss = 100;
        this._seaMaterial.specular = 1;
        this._seaGeom = new PrimitivePlanePrefab(50000, 50000, 1, 1, true, false);
        this._seaMesh = this._seaGeom.getNewObject();
        this._seaGeom.geometry.scaleUV(100, 100);
        this._seaMesh.subMeshes[0].uvTransform = new UVTransform();
        this._seaMesh.material = this._seaMaterial;
        this._view.scene.addChild(new Skybox(this._skyboxCubeTexture));
        this._view.scene.addChild(this._seaMesh);
    };
    AircraftDemo.prototype.onResourceComplete = function (event) {
        var loader = event.target;
        var numAssets = loader.baseDependency.assets.length;
        var i = 0;
        switch (event.url) {
            case "assets/sea_normals.jpg":
                this._seaNormalTexture = loader.baseDependency.assets[0];
                break;
            case 'assets/f14/f14d.obj':
                this._f14Geom = new DisplayObjectContainer();
                for (i = 0; i < numAssets; ++i) {
                    var asset = loader.baseDependency.assets[i];
                    switch (asset.assetType) {
                        case AssetType.MESH:
                            var mesh = asset;
                            this._f14Geom.addChild(mesh);
                            break;
                        case AssetType.GEOMETRY:
                            break;
                        case AssetType.MATERIAL:
                            break;
                    }
                }
                break;
            case 'assets/skybox/CubeTextureTest.cube':
                this._skyboxCubeTexture = loader.baseDependency.assets[0];
                break;
        }
        this.initializeScene();
    };
    AircraftDemo.prototype.render = function (dt) {
        if (this._f14Geom) {
            this._rollIncrement += 0.02;
            switch (this._state) {
                case 0:
                    this._f14Geom.rotationZ = Math.sin(this._rollIncrement) * 25;
                    break;
                case 1:
                    this._loopIncrement += 0.05;
                    this._f14Geom.z += Math.cos(this._loopIncrement) * 20;
                    this._f14Geom.y += Math.sin(this._loopIncrement) * 20;
                    this._f14Geom.rotationX += -1 * ((Math.PI / 180) * Math.atan2(this._f14Geom.z, this._f14Geom.y)); //* 20;
                    this._f14Geom.rotationZ = Math.sin(this._rollIncrement) * 25;
                    if (this._loopIncrement > (Math.PI * 2)) {
                        this._loopIncrement = 0;
                        this._state = 0;
                    }
                    break;
            }
        }
        if (this._f14Geom) {
            this._view.camera.lookAt(this._f14Geom.transform.position);
        }
        if (this._view.camera) {
            this._cameraIncrement += 0.01;
            this._view.camera.x = Math.cos(this._cameraIncrement) * 400;
            this._view.camera.z = Math.sin(this._cameraIncrement) * 400;
        }
        if (this._f14Geom) {
            this._view.camera.lookAt(this._f14Geom.transform.position);
        }
        if (this._seaMaterial) {
            this._seaMesh.subMeshes[0].uvTransform.offsetV -= 0.04;
        }
        this._appTime += dt;
        this._view.render();
    };
    AircraftDemo.prototype.onResize = function (event) {
        if (event === void 0) { event = null; }
        this._view.y = 0;
        this._view.x = 0;
        this._view.width = window.innerWidth;
        this._view.height = window.innerHeight;
    };
    AircraftDemo.prototype.onMouseDown = function (event) {
        this._state++;
        if (this._state >= this._maxStates)
            this._state = 0;
    };
    return AircraftDemo;
})();
window.onload = function () {
    new AircraftDemo();
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9BaXJjcmFmdERlbW8udHMiXSwibmFtZXMiOlsiQWlyY3JhZnREZW1vIiwiQWlyY3JhZnREZW1vLmNvbnN0cnVjdG9yIiwiQWlyY3JhZnREZW1vLmxvYWRBc3NldHMiLCJBaXJjcmFmdERlbW8ubG9hZEFzc2V0IiwiQWlyY3JhZnREZW1vLmluaXRQYXJzZXJzIiwiQWlyY3JhZnREZW1vLmluaXRBbmltYXRpb24iLCJBaXJjcmFmdERlbW8uaW5pdFZpZXciLCJBaXJjcmFmdERlbW8uaW5pdGlhbGl6ZVNjZW5lIiwiQWlyY3JhZnREZW1vLmluaXRMaWdodHMiLCJBaXJjcmFmdERlbW8uaW5pdEYxNCIsIkFpcmNyYWZ0RGVtby5pbml0U2VhIiwiQWlyY3JhZnREZW1vLm9uUmVzb3VyY2VDb21wbGV0ZSIsIkFpcmNyYWZ0RGVtby5yZW5kZXIiLCJBaXJjcmFmdERlbW8ub25SZXNpemUiLCJBaXJjcmFmdERlbW8ub25Nb3VzZURvd24iXSwibWFwcGluZ3MiOiJBQUNBLElBQU8sV0FBVyxXQUFlLG9DQUFvQyxDQUFDLENBQUM7QUFDdkUsSUFBTyxXQUFXLFdBQWUsa0NBQWtDLENBQUMsQ0FBQztBQUNyRSxJQUFPLFFBQVEsV0FBZ0IsK0JBQStCLENBQUMsQ0FBQztBQUNoRSxJQUFPLFlBQVksV0FBZSxzQ0FBc0MsQ0FBQyxDQUFDO0FBSTFFLElBQU8sU0FBUyxXQUFlLG1DQUFtQyxDQUFDLENBQUM7QUFFcEUsSUFBTyxVQUFVLFdBQWUsZ0NBQWdDLENBQUMsQ0FBQztBQUdsRSxJQUFPLEtBQUssV0FBNEIsNkJBQTZCLENBQUMsQ0FBQztBQUN2RSxJQUFPLHFCQUFxQixXQUFZLDZDQUE2QyxDQUFDLENBQUM7QUFFdkYsSUFBTyxzQkFBc0IsV0FBWSxzREFBc0QsQ0FBQyxDQUFDO0FBQ2pHLElBQU8sSUFBSSxXQUFpQixvQ0FBb0MsQ0FBQyxDQUFDO0FBRWxFLElBQU8sZ0JBQWdCLFdBQWMsOENBQThDLENBQUMsQ0FBQztBQUVyRixJQUFPLE1BQU0sV0FBZ0Is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S0FBS0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0E7UUFDL0RBLENBQUNBO1FBRURBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBO1lBQ3BCQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLElBQUlBLElBQUlBLENBQUNBO1lBQzlCQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLEdBQUNBLEdBQUdBLENBQUNBO1lBQzFEQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLEdBQUNBLEdBQUdBLENBQUNBO1FBQzlEQSxDQUFDQTtRQUVEQSxFQUFFQSxDQUFDQSxDQUFFQSxJQUFJQSxDQUFDQSxRQUFTQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNsQkEsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0E7UUFDL0RBLENBQUNBO1FBRURBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLENBQUNBLENBQUNBO1lBQ3BCQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxXQUFXQSxDQUFDQSxPQUFPQSxJQUFJQSxJQUFJQSxDQUFDQTtRQVEzREEsQ0FBQ0E7UUFFREEsSUFBSUEsQ0FBQ0EsUUFBUUEsSUFBSUEsRUFBRUEsQ0FBQ0E7UUFDcEJBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLE1BQU1BLEVBQUVBLENBQUNBO0lBQ3hCQSxDQUFDQTtJQUVNWiwrQkFBUUEsR0FBZkEsVUFBZ0JBLEtBQW9CQTtRQUFwQmEscUJBQW9CQSxHQUFwQkEsWUFBb0JBO1FBRWhDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtRQUNqQkEsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7UUFDakJBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLEtBQUtBLEdBQUdBLE1BQU1BLENBQUNBLFVBQVVBLENBQUNBO1FBQ3JDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxHQUFHQSxNQUFNQSxDQUFDQSxXQUFXQSxDQUFDQTtJQUMzQ0EsQ0FBQ0E7SUFFT2Isa0NBQVdBLEdBQW5CQSxVQUFvQkEsS0FBZ0JBO1FBRWhDYyxJQUFJQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQTtRQUVkQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxJQUFJQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQTtZQUMvQkEsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7SUFDeEJBLENBQUNBO0lBQ0xkLG1CQUFDQTtBQUFEQSxDQTNQQSxBQTJQQ0EsSUFBQTtBQUVELE1BQU0sQ0FBQyxNQUFNLEdBQUc7SUFFWixJQUFJLFlBQVksRUFBRSxDQUFDO0FBQ3ZCLENBQUMsQ0FBQSIsImZpbGUiOiJBaXJjcmFmdERlbW8uanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQXNzZXRFdmVudFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvZXZlbnRzL0Fzc2V0RXZlbnRcIik7XG5pbXBvcnQgTG9hZGVyRXZlbnRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2V2ZW50cy9Mb2FkZXJFdmVudFwiKTtcbmltcG9ydCBVVlRyYW5zZm9ybVx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvZ2VvbS9VVlRyYW5zZm9ybVwiKTtcbmltcG9ydCBWZWN0b3IzRFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9nZW9tL1ZlY3RvcjNEXCIpO1xuaW1wb3J0IEFzc2V0TGlicmFyeVx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvbGlicmFyeS9Bc3NldExpYnJhcnlcIik7XG5pbXBvcnQgQXNzZXRMb2FkZXJcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2xpYnJhcnkvQXNzZXRMb2FkZXJcIik7XG5pbXBvcnQgQXNzZXRMb2FkZXJDb250ZXh0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2xpYnJhcnkvQXNzZXRMb2FkZXJDb250ZXh0XCIpO1xuaW1wb3J0IEFzc2V0TG9hZGVyVG9rZW5cdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9saWJyYXJ5L0Fzc2V0TG9hZGVyVG9rZW5cIik7XG5pbXBvcnQgQXNzZXRUeXBlXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9saWJyYXJ5L0Fzc2V0VHlwZVwiKTtcbmltcG9ydCBJQXNzZXRcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvbGlicmFyeS9JQXNzZXRcIik7XG5pbXBvcnQgVVJMUmVxdWVzdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvbmV0L1VSTFJlcXVlc3RcIik7XG5pbXBvcnQgSW1hZ2VDdWJlVGV4dHVyZVx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL3RleHR1cmVzL0ltYWdlQ3ViZVRleHR1cmVcIik7XG5pbXBvcnQgSW1hZ2VUZXh0dXJlXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi90ZXh0dXJlcy9JbWFnZVRleHR1cmVcIik7XG5pbXBvcnQgRGVidWcgICAgICAgICAgICAgICAgXHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi91dGlscy9EZWJ1Z1wiKTtcbmltcG9ydCBSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL3V0aWxzL1JlcXVlc3RBbmltYXRpb25GcmFtZVwiKTtcblxuaW1wb3J0IERpc3BsYXlPYmplY3RDb250YWluZXJcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2NvbnRhaW5lcnMvRGlzcGxheU9iamVjdENvbnRhaW5lclwiKTtcbmltcG9ydCBWaWV3XHRcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvY29udGFpbmVycy9WaWV3XCIpO1xuaW1wb3J0IEhvdmVyQ29udHJvbGxlclx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2NvbnRyb2xsZXJzL0hvdmVyQ29udHJvbGxlclwiKTtcbmltcG9ydCBEaXJlY3Rpb25hbExpZ2h0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvZW50aXRpZXMvRGlyZWN0aW9uYWxMaWdodFwiKTtcbmltcG9ydCBNZXNoXHRcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvZW50aXRpZXMvTWVzaFwiKTtcbmltcG9ydCBTa3lib3hcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvZW50aXRpZXMvU2t5Ym94XCIpO1xuaW1wb3J0IFN0YXRpY0xpZ2h0UGlja2VyXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL21hdGVyaWFscy9saWdodHBpY2tlcnMvU3RhdGljTGlnaHRQaWNrZXJcIik7XG5pbXBvcnQgUHJpbWl0aXZlUGxhbmVQcmVmYWJcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvcHJlZmFicy9QcmltaXRpdmVQbGFuZVByZWZhYlwiKTtcblxuaW1wb3J0IERlZmF1bHRSZW5kZXJlclx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXJlbmRlcmVyZ2wvbGliL0RlZmF1bHRSZW5kZXJlclwiKTtcblxuaW1wb3J0IE1ldGhvZE1hdGVyaWFsXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtbWV0aG9kbWF0ZXJpYWxzL2xpYi9NZXRob2RNYXRlcmlhbFwiKTtcbmltcG9ydCBNZXRob2RSZW5kZXJlclBvb2xcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtbWV0aG9kbWF0ZXJpYWxzL2xpYi9wb29sL01ldGhvZFJlbmRlcmVyUG9vbFwiKTtcbmltcG9ydCBFZmZlY3RFbnZNYXBNZXRob2QgICBcdFx0PSByZXF1aXJlKFwiYXdheWpzLW1ldGhvZG1hdGVyaWFscy9saWIvbWV0aG9kcy9FZmZlY3RFbnZNYXBNZXRob2RcIik7XG5pbXBvcnQgTm9ybWFsU2ltcGxlV2F0ZXJNZXRob2RcdFx0PSByZXF1aXJlKFwiYXdheWpzLW1ldGhvZG1hdGVyaWFscy9saWIvbWV0aG9kcy9Ob3JtYWxTaW1wbGVXYXRlck1ldGhvZFwiKTtcbmltcG9ydCBTcGVjdWxhckZyZXNuZWxNZXRob2RcdFx0PSByZXF1aXJlKFwiYXdheWpzLW1ldGhvZG1hdGVyaWFscy9saWIvbWV0aG9kcy9TcGVjdWxhckZyZXNuZWxNZXRob2RcIik7XG5cbmltcG9ydCBBV0RQYXJzZXJcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXBhcnNlcnMvbGliL0FXRFBhcnNlclwiKTtcbmltcG9ydCBPQkpQYXJzZXJcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXBhcnNlcnMvbGliL09CSlBhcnNlclwiKTtcblxuY2xhc3MgQWlyY3JhZnREZW1vXG57XG4gICAgLy97IHN0YXRlXG4gICAgcHJpdmF0ZSBfbWF4U3RhdGVzOm51bWJlciA9IDI7XG4gICAgcHJpdmF0ZSBfY2FtZXJhSW5jcmVtZW50Om51bWJlciA9IDA7XG4gICAgcHJpdmF0ZSBfcm9sbEluY3JlbWVudDpudW1iZXIgPSAwO1xuICAgIHByaXZhdGUgX2xvb3BJbmNyZW1lbnQ6bnVtYmVyID0gMDtcbiAgICBwcml2YXRlIF9zdGF0ZTpudW1iZXIgPSAwO1xuICAgIHByaXZhdGUgX2FwcFRpbWU6bnVtYmVyID0gMDtcbiAgICAvL31cbiAgICBcbiAgICBwcml2YXRlIF9saWdodFBpY2tlcjpTdGF0aWNMaWdodFBpY2tlcjtcbiAgICBwcml2YXRlIF92aWV3OlZpZXc7XG4gICAgcHJpdmF0ZSBfdGltZXI6UmVxdWVzdEFuaW1hdGlvbkZyYW1lO1xuICAgIFxuICAgIC8veyBzZWFcbiAgICBwcml2YXRlIF9zZWFHZW9tOlByaW1pdGl2ZVBsYW5lUHJlZmFiO1xuICAgIHByaXZhdGUgX3NlYU1lc2g6TWVzaDtcbiAgICBwcml2YXRlIF9zZWFOb3JtYWxUZXh0dXJlOkltYWdlVGV4dHVyZTtcbiAgICBwcml2YXRlIF9zZWFJbml0aWFsaXplZDpib29sZWFuID0gZmFsc2U7XG4gICAgcHJpdmF0ZSBfc2VhTWF0ZXJpYWw6TWV0aG9kTWF0ZXJpYWw7XG4gICAgLy99XG4gICAgXG4gICAgLy97IGYxNFxuICAgIHByaXZhdGUgX2YxNEdlb206RGlzcGxheU9iamVjdENvbnRhaW5lcjtcbiAgICBwcml2YXRlIF9mMTRJbml0aWFsaXplZDpib29sZWFuID0gZmFsc2U7XG4gICAgLy99XG4gICAgXG4gICAgLy97IHNreWJveFxuICAgIHByaXZhdGUgX3dhdGVyTWV0aG9kOk5vcm1hbFNpbXBsZVdhdGVyTWV0aG9kO1xuICAgIHByaXZhdGUgX3NreWJveEN1YmVUZXh0dXJlOkltYWdlQ3ViZVRleHR1cmU7XG4gICAgcHJpdmF0ZSBfc2t5Ym94SW5pdGlhbGl6ZWQ6Ym9vbGVhbiA9IGZhbHNlO1xuICAgIC8vfVxuICAgIFxuICAgIGNvbnN0cnVjdG9yKClcbiAgICB7XG4gICAgICAgIERlYnVnLkxPR19QSV9FUlJPUlMgPSBmYWxzZTtcbiAgICAgICAgRGVidWcuVEhST1dfRVJST1JTID0gZmFsc2U7XG4gICAgICAgIFxuICAgICAgICB0aGlzLmluaXRWaWV3KCk7XG4gICAgICAgIHRoaXMuaW5pdExpZ2h0cygpO1xuICAgICAgICB0aGlzLmluaXRBbmltYXRpb24oKTtcbiAgICAgICAgdGhpcy5pbml0UGFyc2VycygpO1xuICAgICAgICB0aGlzLmxvYWRBc3NldHMoKTtcbiAgICAgICAgXG4gICAgICAgIHdpbmRvdy5vbnJlc2l6ZSA9IChldmVudDpVSUV2ZW50KSA9PiB0aGlzLm9uUmVzaXplKGV2ZW50KTtcbiAgICB9XG4gICAgXG4gICAgcHJpdmF0ZSBsb2FkQXNzZXRzKCk6dm9pZFxuICAgIHtcbiAgICAgICAgdGhpcy5sb2FkQXNzZXQoJ2Fzc2V0cy9zZWFfbm9ybWFscy5qcGcnKTtcbiAgICAgICAgdGhpcy5sb2FkQXNzZXQoJ2Fzc2V0cy9mMTQvZjE0ZC5vYmonKTtcbiAgICAgICAgdGhpcy5sb2FkQXNzZXQoJ2Fzc2V0cy9za3lib3gvQ3ViZVRleHR1cmVUZXN0LmN1YmUnKTtcbiAgICB9XG4gICAgXG4gICAgcHJpdmF0ZSBsb2FkQXNzZXQocGF0aDpzdHJpbmcpOnZvaWRcbiAgICB7XG4gICAgICAgIHZhciB0b2tlbjpBc3NldExvYWRlclRva2VuID0gQXNzZXRMaWJyYXJ5LmxvYWQobmV3IFVSTFJlcXVlc3QocGF0aCkpO1xuICAgICAgICB0b2tlbi5hZGRFdmVudExpc3RlbmVyKExvYWRlckV2ZW50LlJFU09VUkNFX0NPTVBMRVRFLCAoZXZlbnQ6TG9hZGVyRXZlbnQpID0+IHRoaXMub25SZXNvdXJjZUNvbXBsZXRlKGV2ZW50KSk7XG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgaW5pdFBhcnNlcnMoKTp2b2lkXG4gICAge1xuICAgICAgICBBc3NldExpYnJhcnkuZW5hYmxlUGFyc2VyKE9CSlBhcnNlcik7XG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgaW5pdEFuaW1hdGlvbigpOnZvaWRcbiAgICB7XG4gICAgICAgIHRoaXMuX3RpbWVyID0gbmV3IFJlcXVlc3RBbmltYXRpb25GcmFtZSggdGhpcy5yZW5kZXIsIHRoaXMgKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGluaXRWaWV3KCk6dm9pZFxuICAgIHtcbiAgICAgICAgdGhpcy5fdmlldyA9IG5ldyBWaWV3KG5ldyBEZWZhdWx0UmVuZGVyZXIoTWV0aG9kUmVuZGVyZXJQb29sKSk7XG4gICAgICAgIHRoaXMuX3ZpZXcuY2FtZXJhLnpcdD0gLTUwMDtcbiAgICAgICAgdGhpcy5fdmlldy5jYW1lcmEueVx0PSAyNTA7XG4gICAgICAgIHRoaXMuX3ZpZXcuY2FtZXJhLnJvdGF0aW9uWFx0PSAyMDtcbiAgICAgICAgdGhpcy5fdmlldy5jYW1lcmEucHJvamVjdGlvbi5uZWFyID0gMC41O1xuICAgICAgICB0aGlzLl92aWV3LmNhbWVyYS5wcm9qZWN0aW9uLmZhciA9IDE0MDAwO1xuICAgICAgICB0aGlzLl92aWV3LmJhY2tncm91bmRDb2xvciA9IDB4MmMyYzMyO1xuXG4gICAgICAgIHRoaXMub25SZXNpemUoKTtcbiAgICB9XG4gICAgXG4gICAgcHJpdmF0ZSBpbml0aWFsaXplU2NlbmUoKTp2b2lkXG4gICAge1xuICAgICAgICBpZih0aGlzLl9za3lib3hDdWJlVGV4dHVyZSAmJiB0aGlzLl9mMTRHZW9tICYmIHRoaXMuX3NlYU5vcm1hbFRleHR1cmUpIHtcbiAgICAgICAgICAgIHRoaXMuaW5pdEYxNCgpO1xuICAgICAgICAgICAgdGhpcy5pbml0U2VhKCk7XG4gICAgICAgICAgICB0aGlzLl90aW1lci5zdGFydCgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgaW5pdExpZ2h0cygpOnZvaWRcbiAgICB7XG4gICAgICAgIHZhciBsaWdodDpEaXJlY3Rpb25hbExpZ2h0ID0gbmV3IERpcmVjdGlvbmFsTGlnaHQoKTtcbiAgICAgICAgbGlnaHQuY29sb3JcdD0gMHg5NzQ1MjM7XG4gICAgICAgIGxpZ2h0LmRpcmVjdGlvblx0PSBuZXcgVmVjdG9yM0QoLTMwMCwgLTMwMCwgLTUwMDApO1xuICAgICAgICBsaWdodC5hbWJpZW50ID0gMTtcbiAgICAgICAgbGlnaHQuYW1iaWVudENvbG9yID0gMHg3MTk2YWM7XG4gICAgICAgIGxpZ2h0LmRpZmZ1c2UgPSAxLjI7XG4gICAgICAgIGxpZ2h0LnNwZWN1bGFyID0gMS4xO1xuICAgICAgICB0aGlzLl92aWV3LnNjZW5lLmFkZENoaWxkKGxpZ2h0KTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuX2xpZ2h0UGlja2VyID0gbmV3IFN0YXRpY0xpZ2h0UGlja2VyKFtsaWdodF0pO1xuICAgIH1cbiAgICBcbiAgICBwcml2YXRlIGluaXRGMTQoKTp2b2lkXG4gICAge1xuICAgICAgICB0aGlzLl9mMTRJbml0aWFsaXplZCA9IHRydWU7XG4gICAgICAgIFxuICAgICAgICB2YXIgZjE0TWF0ZXJpYWw6IE1ldGhvZE1hdGVyaWFsID0gbmV3IE1ldGhvZE1hdGVyaWFsKHRoaXMuX3NlYU5vcm1hbFRleHR1cmUsIHRydWUsIHRydWUsIGZhbHNlKTsgLy8gd2lsbCBiZSB0aGUgY3ViZW1hcFxuICAgICAgICBmMTRNYXRlcmlhbC5saWdodFBpY2tlciA9IHRoaXMuX2xpZ2h0UGlja2VyO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5fdmlldy5zY2VuZS5hZGRDaGlsZCh0aGlzLl9mMTRHZW9tKTtcbiAgICAgICAgdGhpcy5fZjE0R2VvbS50cmFuc2Zvcm0uc2NhbGUgPSBuZXcgVmVjdG9yM0QoMjAsIDIwLCAyMCk7XG4gICAgICAgIHRoaXMuX2YxNEdlb20ucm90YXRpb25YID0gOTA7XG4gICAgICAgIHRoaXMuX2YxNEdlb20ueSA9IDIwMDtcbiAgICAgICAgdGhpcy5fdmlldy5jYW1lcmEubG9va0F0KHRoaXMuX2YxNEdlb20udHJhbnNmb3JtLnBvc2l0aW9uKTtcbiAgICAgICAgXG4gICAgICAgIGRvY3VtZW50Lm9ubW91c2Vkb3duID0gKGV2ZW50Ok1vdXNlRXZlbnQpID0+IHRoaXMub25Nb3VzZURvd24oZXZlbnQpO1xuICAgIH1cblxuICAgIHByaXZhdGUgaW5pdFNlYSgpOnZvaWRcbiAgICB7XG4gICAgICAgIHRoaXMuX3NlYU1hdGVyaWFsID0gbmV3IE1ldGhvZE1hdGVyaWFsKHRoaXMuX3NlYU5vcm1hbFRleHR1cmUsIHRydWUsIHRydWUsIGZhbHNlKTsgLy8gd2lsbCBiZSB0aGUgY3ViZW1hcFxuICAgICAgICB0aGlzLl93YXRlck1ldGhvZCA9IG5ldyBOb3JtYWxTaW1wbGVXYXRlck1ldGhvZCh0aGlzLl9zZWFOb3JtYWxUZXh0dXJlLCB0aGlzLl9zZWFOb3JtYWxUZXh0dXJlKTtcbiAgICAgICAgdmFyIGZyZXNuZWxNZXRob2Q6U3BlY3VsYXJGcmVzbmVsTWV0aG9kICA9IG5ldyBTcGVjdWxhckZyZXNuZWxNZXRob2QoKTtcbiAgICAgICAgZnJlc25lbE1ldGhvZC5ub3JtYWxSZWZsZWN0YW5jZSA9IC4zO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5fc2VhTWF0ZXJpYWwuYWxwaGFCbGVuZGluZyA9IHRydWU7XG4gICAgICAgIHRoaXMuX3NlYU1hdGVyaWFsLmxpZ2h0UGlja2VyID0gdGhpcy5fbGlnaHRQaWNrZXI7XG4gICAgICAgIHRoaXMuX3NlYU1hdGVyaWFsLnJlcGVhdCA9IHRydWU7XG4gICAgICAgIHRoaXMuX3NlYU1hdGVyaWFsLmFuaW1hdGVVVnMgPSB0cnVlO1xuICAgICAgICB0aGlzLl9zZWFNYXRlcmlhbC5ub3JtYWxNZXRob2QgPSB0aGlzLl93YXRlck1ldGhvZCA7XG4gICAgICAgIHRoaXMuX3NlYU1hdGVyaWFsLmFkZEVmZmVjdE1ldGhvZChuZXcgRWZmZWN0RW52TWFwTWV0aG9kKHRoaXMuX3NreWJveEN1YmVUZXh0dXJlKSk7XG4gICAgICAgIHRoaXMuX3NlYU1hdGVyaWFsLnNwZWN1bGFyTWV0aG9kID0gZnJlc25lbE1ldGhvZDtcbiAgICAgICAgdGhpcy5fc2VhTWF0ZXJpYWwuZ2xvc3MgPSAxMDA7XG4gICAgICAgIHRoaXMuX3NlYU1hdGVyaWFsLnNwZWN1bGFyID0gMTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuX3NlYUdlb20gPSBuZXcgUHJpbWl0aXZlUGxhbmVQcmVmYWIoIDUwMDAwLCA1MDAwMCwgMSwgMSwgdHJ1ZSwgZmFsc2UgKTtcbiAgICAgICAgdGhpcy5fc2VhTWVzaCA9IDxNZXNoPiB0aGlzLl9zZWFHZW9tLmdldE5ld09iamVjdCgpO1xuICAgICAgICB0aGlzLl9zZWFHZW9tLmdlb21ldHJ5LnNjYWxlVVYoIDEwMCwgMTAwICk7XG4gICAgICAgIHRoaXMuX3NlYU1lc2guc3ViTWVzaGVzWzBdLnV2VHJhbnNmb3JtID0gbmV3IFVWVHJhbnNmb3JtKCk7XG4gICAgICAgIHRoaXMuX3NlYU1lc2gubWF0ZXJpYWwgPSB0aGlzLl9zZWFNYXRlcmlhbDtcbiAgICAgICAgdGhpcy5fdmlldy5zY2VuZS5hZGRDaGlsZCggbmV3IFNreWJveCh0aGlzLl9za3lib3hDdWJlVGV4dHVyZSkpO1xuICAgICAgICB0aGlzLl92aWV3LnNjZW5lLmFkZENoaWxkKCB0aGlzLl9zZWFNZXNoICk7XG4gICAgfVxuICAgIFxuICAgIHB1YmxpYyBvblJlc291cmNlQ29tcGxldGUoZXZlbnQ6TG9hZGVyRXZlbnQpXG4gICAge1xuICAgICAgICB2YXIgbG9hZGVyOkFzc2V0TG9hZGVyID0gPEFzc2V0TG9hZGVyPiBldmVudC50YXJnZXQ7XG4gICAgICAgIHZhciBudW1Bc3NldHM6bnVtYmVyID0gbG9hZGVyLmJhc2VEZXBlbmRlbmN5LmFzc2V0cy5sZW5ndGg7XG4gICAgICAgIHZhciBpOm51bWJlciA9IDA7XG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggKGV2ZW50LnVybCkge1xuICAgICAgICAgICAgY2FzZSBcImFzc2V0cy9zZWFfbm9ybWFscy5qcGdcIjpcbiAgICAgICAgICAgICAgICB0aGlzLl9zZWFOb3JtYWxUZXh0dXJlID0gPEltYWdlVGV4dHVyZT4gbG9hZGVyLmJhc2VEZXBlbmRlbmN5LmFzc2V0c1swXTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2Fzc2V0cy9mMTQvZjE0ZC5vYmonOlxuICAgICAgICAgICAgICAgIHRoaXMuX2YxNEdlb20gPSBuZXcgRGlzcGxheU9iamVjdENvbnRhaW5lcigpO1xuICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBudW1Bc3NldHM7ICsraSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgYXNzZXQ6SUFzc2V0ID0gbG9hZGVyLmJhc2VEZXBlbmRlbmN5LmFzc2V0c1tpXTtcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChhc3NldC5hc3NldFR5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgQXNzZXRUeXBlLk1FU0g6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG1lc2g6TWVzaCA9IDxNZXNoPiBhc3NldDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9mMTRHZW9tLmFkZENoaWxkKG1lc2gpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBBc3NldFR5cGUuR0VPTUVUUlk6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIEFzc2V0VHlwZS5NQVRFUklBTDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2Fzc2V0cy9za3lib3gvQ3ViZVRleHR1cmVUZXN0LmN1YmUnOlxuICAgICAgICAgICAgICAgIHRoaXMuX3NreWJveEN1YmVUZXh0dXJlID0gPEltYWdlQ3ViZVRleHR1cmU+IGxvYWRlci5iYXNlRGVwZW5kZW5jeS5hc3NldHNbMF07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZVNjZW5lKCk7XG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgcmVuZGVyKGR0Om51bWJlcikgLy9hbmltYXRlIGJhc2VkIG9uIGR0IGZvciBmaXJlZm94XG4gICAge1xuICAgICAgICBpZiAodGhpcy5fZjE0R2VvbSkge1xuICAgICAgICAgICAgdGhpcy5fcm9sbEluY3JlbWVudCArPSAwLjAyO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBzd2l0Y2ggKHRoaXMuX3N0YXRlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAwIDpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZjE0R2VvbS5yb3RhdGlvblogPSBNYXRoLnNpbih0aGlzLl9yb2xsSW5jcmVtZW50KSoyNTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAxIDpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fbG9vcEluY3JlbWVudCArPSAwLjA1O1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9mMTRHZW9tLnogKz0gTWF0aC5jb3ModGhpcy5fbG9vcEluY3JlbWVudCkqMjA7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2YxNEdlb20ueSArPSBNYXRoLnNpbih0aGlzLl9sb29wSW5jcmVtZW50KSoyMDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZjE0R2VvbS5yb3RhdGlvblggKz0gLTEqKChNYXRoLlBJLzE4MCkqTWF0aC5hdGFuMih0aGlzLl9mMTRHZW9tLnosIHRoaXMuX2YxNEdlb20ueSkpOy8vKiAyMDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZjE0R2VvbS5yb3RhdGlvblogPSBNYXRoLnNpbih0aGlzLl9yb2xsSW5jcmVtZW50KSoyNTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9sb29wSW5jcmVtZW50ID4gKE1hdGguUEkqMikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2xvb3BJbmNyZW1lbnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fc3RhdGUgPSAwO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAodGhpcy5fZjE0R2VvbSkge1xuICAgICAgICAgICAgdGhpcy5fdmlldy5jYW1lcmEubG9va0F0KHRoaXMuX2YxNEdlb20udHJhbnNmb3JtLnBvc2l0aW9uKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYgKHRoaXMuX3ZpZXcuY2FtZXJhKSB7XG4gICAgICAgICAgICB0aGlzLl9jYW1lcmFJbmNyZW1lbnQgKz0gMC4wMTtcbiAgICAgICAgICAgIHRoaXMuX3ZpZXcuY2FtZXJhLnggPSBNYXRoLmNvcyh0aGlzLl9jYW1lcmFJbmNyZW1lbnQpKjQwMDtcbiAgICAgICAgICAgIHRoaXMuX3ZpZXcuY2FtZXJhLnogPSBNYXRoLnNpbih0aGlzLl9jYW1lcmFJbmNyZW1lbnQpKjQwMDtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYgKCB0aGlzLl9mMTRHZW9tICkge1xuICAgICAgICAgICAgdGhpcy5fdmlldy5jYW1lcmEubG9va0F0KHRoaXMuX2YxNEdlb20udHJhbnNmb3JtLnBvc2l0aW9uKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYgKHRoaXMuX3NlYU1hdGVyaWFsKSB7XG4gICAgICAgICAgICB0aGlzLl9zZWFNZXNoLnN1Yk1lc2hlc1swXS51dlRyYW5zZm9ybS5vZmZzZXRWIC09IDAuMDQ7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgdGhpcy53YXRlck1ldGhvZC53YXRlcjFPZmZzZXRYICs9IC4wMDE7XG4gICAgICAgICAgICAgdGhpcy53YXRlck1ldGhvZC53YXRlcjFPZmZzZXRZICs9IC4xO1xuICAgICAgICAgICAgIHRoaXMud2F0ZXJNZXRob2Qud2F0ZXIyT2Zmc2V0WCArPSAuMDAwNztcbiAgICAgICAgICAgICB0aGlzLndhdGVyTWV0aG9kLndhdGVyMk9mZnNldFkgKz0gLjY7XG4gICAgICAgICAgICAgLy8qL1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB0aGlzLl9hcHBUaW1lICs9IGR0O1xuICAgICAgICB0aGlzLl92aWV3LnJlbmRlcigpO1xuICAgIH1cbiAgICBcbiAgICBwdWJsaWMgb25SZXNpemUoZXZlbnQ6VUlFdmVudCA9IG51bGwpXG4gICAge1xuICAgICAgICB0aGlzLl92aWV3LnkgPSAwO1xuICAgICAgICB0aGlzLl92aWV3LnggPSAwO1xuICAgICAgICB0aGlzLl92aWV3LndpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XG4gICAgICAgIHRoaXMuX3ZpZXcuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xuICAgIH1cbiAgICBcbiAgICBwcml2YXRlIG9uTW91c2VEb3duKGV2ZW50Ok1vdXNlRXZlbnQpXG4gICAge1xuICAgICAgICB0aGlzLl9zdGF0ZSsrO1xuICAgICAgICBcbiAgICAgICAgaWYgKHRoaXMuX3N0YXRlID49IHRoaXMuX21heFN0YXRlcylcbiAgICAgICAgICAgIHRoaXMuX3N0YXRlID0gMDtcbiAgICB9XG59XG5cbndpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbiAoKVxue1xuICAgIG5ldyBBaXJjcmFmdERlbW8oKTtcbn0iXX0=