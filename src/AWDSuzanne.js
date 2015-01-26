var LoaderEvent = require("awayjs-core/lib/events/LoaderEvent");
var Vector3D = require("awayjs-core/lib/geom/Vector3D");
var AssetLibrary = require("awayjs-core/lib/library/AssetLibrary");
var AssetType = require("awayjs-core/lib/library/AssetType");
var URLRequest = require("awayjs-core/lib/net/URLRequest");
var RequestAnimationFrame = require("awayjs-core/lib/utils/RequestAnimationFrame");
var View = require("awayjs-display/lib/containers/View");
var DirectionalLight = require("awayjs-display/lib/entities/DirectionalLight");
var MouseEvent = require("awayjs-display/lib/events/MouseEvent");
var StaticLightPicker = require("awayjs-display/lib/materials/lightpickers/StaticLightPicker");
var DefaultRenderer = require("awayjs-renderergl/lib/DefaultRenderer");
var JSPickingCollider = require("awayjs-renderergl/lib/pick/JSPickingCollider");
var MethodMaterial = require("awayjs-methodmaterials/lib/MethodMaterial");
var MethodRendererPool = require("awayjs-methodmaterials/lib/pool/MethodRendererPool");
var AWDParser = require("awayjs-parsers/lib/AWDParser");
var AWDSuzanne = (function () {
    function AWDSuzanne() {
        var _this = this;
        this._lookAtPosition = new Vector3D();
        this._cameraIncrement = 0;
        this._mouseOverMaterial = new MethodMaterial(0xFF0000);
        this.initView();
        this.loadAssets();
        this.initLights();
        window.onresize = function (event) { return _this.onResize(event); };
        this.onResize();
    }
    /**
     *
     */
    AWDSuzanne.prototype.initView = function () {
        this._renderer = new DefaultRenderer(MethodRendererPool);
        this._view = new View(this._renderer);
        this._view.camera.projection.far = 6000;
        this._view.forceMouseMove = true;
    };
    /**
     *
     */
    AWDSuzanne.prototype.loadAssets = function () {
        var _this = this;
        this._timer = new RequestAnimationFrame(this.render, this);
        this._timer.start();
        AssetLibrary.enableParser(AWDParser);
        this._token = AssetLibrary.load(new URLRequest('assets/suzanne.awd'));
        this._token.addEventListener(LoaderEvent.RESOURCE_COMPLETE, function (event) { return _this.onResourceComplete(event); });
    };
    /**
     *
     */
    AWDSuzanne.prototype.initLights = function () {
        this._light = new DirectionalLight();
        this._light.color = 0x683019;
        this._light.direction = new Vector3D(1, 0, 0);
        this._light.ambient = 0.1;
        this._light.ambientColor = 0x85b2cd;
        this._light.diffuse = 2.8;
        this._light.specular = 1.8;
        this._view.scene.addChild(this._light);
        this._lightPicker = new StaticLightPicker([this._light]);
    };
    /**
     *
     */
    AWDSuzanne.prototype.onResize = function (event) {
        if (event === void 0) { event = null; }
        this._view.y = 0;
        this._view.x = 0;
        this._view.width = window.innerWidth;
        this._view.height = window.innerHeight;
    };
    /**
     *
     * @param dt
     */
    AWDSuzanne.prototype.render = function (dt) {
        if (this._view.camera) {
            this._view.camera.lookAt(this._lookAtPosition);
            this._cameraIncrement += 0.01;
            this._view.camera.x = Math.cos(this._cameraIncrement) * 1400;
            this._view.camera.z = Math.sin(this._cameraIncrement) * 1400;
            this._light.x = Math.cos(this._cameraIncrement) * 1400;
            this._light.y = Math.sin(this._cameraIncrement) * 1400;
        }
        this._view.render();
    };
    /**
     *
     * @param e
     */
    AWDSuzanne.prototype.onResourceComplete = function (e) {
        var _this = this;
        var loader = e.target;
        var numAssets = loader.baseDependency.assets.length;
        for (var i = 0; i < numAssets; ++i) {
            var asset = loader.baseDependency.assets[i];
            switch (asset.assetType) {
                case AssetType.MESH:
                    var mesh = asset;
                    this._suzane = mesh;
                    this._suzane.material.lightPicker = this._lightPicker;
                    this._suzane.y = -100;
                    this._mouseOutMaterial = this._suzane.material;
                    for (var c = 0; c < 80; c++) {
                        var clone = mesh.clone();
                        var scale = this.getRandom(50, 200);
                        clone.x = this.getRandom(-2000, 2000);
                        clone.y = this.getRandom(-2000, 2000);
                        clone.z = this.getRandom(-2000, 2000);
                        clone.transform.scale = new Vector3D(scale, scale, scale);
                        clone.rotationY = this.getRandom(0, 360);
                        clone.addEventListener(MouseEvent.MOUSE_OVER, function (event) { return _this.onMouseOver(event); });
                        clone.addEventListener(MouseEvent.MOUSE_OUT, function (event) { return _this.onMouseOut(event); });
                        this._view.scene.addChild(clone);
                    }
                    mesh.transform.scale = new Vector3D(500, 500, 500);
                    mesh.pickingCollider = new JSPickingCollider(this._renderer.stage);
                    mesh.addEventListener(MouseEvent.MOUSE_OVER, function (event) { return _this.onMouseOver(event); });
                    mesh.addEventListener(MouseEvent.MOUSE_OUT, function (event) { return _this.onMouseOut(event); });
                    this._view.scene.addChild(mesh);
                    break;
                case AssetType.GEOMETRY:
                    break;
                case AssetType.MATERIAL:
                    break;
            }
        }
    };
    AWDSuzanne.prototype.onMouseOver = function (event) {
        event.object.material = this._mouseOverMaterial;
        console.log("mouseover");
    };
    AWDSuzanne.prototype.onMouseOut = function (event) {
        event.object.material = this._mouseOutMaterial;
        console.log("mouseout");
    };
    /**
     *
     * @param min
     * @param max
     * @returns {number}
     */
    AWDSuzanne.prototype.getRandom = function (min, max) {
        return Math.random() * (max - min) + min;
    };
    return AWDSuzanne;
})();
window.onload = function () {
    new AWDSuzanne();
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9BV0RTdXphbm5lLnRzIl0sIm5hbWVzIjpbIkFXRFN1emFubmUiLCJBV0RTdXphbm5lLmNvbnN0cnVjdG9yIiwiQVdEU3V6YW5uZS5pbml0VmlldyIsIkFXRFN1emFubmUubG9hZEFzc2V0cyIsIkFXRFN1emFubmUuaW5pdExpZ2h0cyIsIkFXRFN1emFubmUub25SZXNpemUiLCJBV0RTdXphbm5lLnJlbmRlciIsIkFXRFN1emFubmUub25SZXNvdXJjZUNvbXBsZXRlIiwiQVdEU3V6YW5uZS5vbk1vdXNlT3ZlciIsIkFXRFN1emFubmUub25Nb3VzZU91dCIsIkFXRFN1emFubmUuZ2V0UmFuZG9tIl0sIm1hcHBpbmdzIjoiQUFDQSxJQUFPLFdBQVcsV0FBZSxvQ0FBb0MsQ0FBQyxDQUFDO0FBQ3ZFLElBQU8sUUFBUSxXQUFnQiwrQkFBK0IsQ0FBQyxDQUFDO0FBQ2hFLElBQU8sWUFBWSxXQUFlLHNDQUFzQyxDQUFDLENBQUM7QUFJMUUsSUFBTyxTQUFTLFdBQWUsbUNBQW1DLENBQUMsQ0FBQztBQUVwRSxJQUFPLFVBQVUsV0FBZSxnQ0FBZ0MsQ0FBQyxDQUFDO0FBQ2xFLElBQU8scUJBQXFCLFdBQVksNkNBQTZDLENBQUMsQ0FBQztBQUV2RixJQUFPLElBQUksV0FBaUIsb0NBQW9DLENBQUMsQ0FBQztBQUVsRSxJQUFPLGdCQUFnQixXQUFjLDhDQUE4QyxDQUFDLENBQUM7QUFFckYsSUFBTyxVQUFVLFdBQWUsc0NBQXNDLENBQUMsQ0FBQztBQUN4RSxJQUFPLGlCQUFpQixXQUFhLDZEQUE2RCxDQUFDLENBQUM7QUFFcEcsSUFBTyxlQUFlLFdBQWMsdUNBQXVDLENBQUMsQ0FBQztBQUM3RSxJQUFPLGlCQUFpQixXQUFhLDhDQUE4QyxDQUFDLENBQUM7QUFFckYsSUFBTyxjQUFjLFdBQWMsMkNBQTJDLENBQUMsQ0FBQztBQUNoRixJQUFPLGtCQUFrQixXQUFhLG9EQUFvRCxDQUFDLENBQUM7QUFDNUYsSUFBTyxTQUFTLFdBQWUsOEJBQThCLENBQUMsQ0FB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QUFPQSxHQUFHQSxJQUFJQSxDQUFDQTtvQkFDRkEsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsUUFBU0EsQ0FBQ0EsV0FBV0EsR0FBR0EsSUFBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0E7b0JBQ3pFQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxHQUFHQSxDQUFDQTtvQkFDdEJBLElBQUlBLENBQUNBLGlCQUFpQkEsR0FBb0JBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLFFBQVFBLENBQUNBO29CQUVoRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBVUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsRUFBRUEsRUFBRUEsQ0FBQ0EsRUFBRUEsRUFBRUEsQ0FBQ0E7d0JBRXBDQSxJQUFJQSxLQUFLQSxHQUFlQSxJQUFJQSxDQUFDQSxLQUFLQSxFQUFFQSxDQUFDQTt3QkFDckNBLElBQUlBLEtBQUtBLEdBQVVBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLEVBQUVBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBO3dCQUMzQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsRUFBRUEsSUFBSUEsQ0FBQ0EsQ0FBQ0E7d0JBQ3RDQSxLQUFLQSxDQUFDQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxJQUFJQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQTt3QkFDdENBLEtBQUtBLENBQUNBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLElBQUlBLEVBQUVBLElBQUlBLENBQUNBLENBQUNBO3dCQUN0Q0EsS0FBS0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsS0FBS0EsR0FBR0EsSUFBSUEsUUFBUUEsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7d0JBQzFEQSxLQUFLQSxDQUFDQSxTQUFTQSxHQUFHQSxJQUFJQSxD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bnRlbnQiOlsiaW1wb3J0IEFzc2V0RXZlbnRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2V2ZW50cy9Bc3NldEV2ZW50XCIpO1xuaW1wb3J0IExvYWRlckV2ZW50XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9ldmVudHMvTG9hZGVyRXZlbnRcIik7XG5pbXBvcnQgVmVjdG9yM0RcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvZ2VvbS9WZWN0b3IzRFwiKTtcbmltcG9ydCBBc3NldExpYnJhcnlcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2xpYnJhcnkvQXNzZXRMaWJyYXJ5XCIpO1xuaW1wb3J0IEFzc2V0TG9hZGVyXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9saWJyYXJ5L0Fzc2V0TG9hZGVyXCIpO1xuaW1wb3J0IEFzc2V0TG9hZGVyQ29udGV4dFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9saWJyYXJ5L0Fzc2V0TG9hZGVyQ29udGV4dFwiKTtcbmltcG9ydCBBc3NldExvYWRlclRva2VuXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvbGlicmFyeS9Bc3NldExvYWRlclRva2VuXCIpO1xuaW1wb3J0IEFzc2V0VHlwZVx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvbGlicmFyeS9Bc3NldFR5cGVcIik7XG5pbXBvcnQgSUFzc2V0XHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2xpYnJhcnkvSUFzc2V0XCIpO1xuaW1wb3J0IFVSTFJlcXVlc3RcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL25ldC9VUkxSZXF1ZXN0XCIpO1xuaW1wb3J0IFJlcXVlc3RBbmltYXRpb25GcmFtZVx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvdXRpbHMvUmVxdWVzdEFuaW1hdGlvbkZyYW1lXCIpO1xuXG5pbXBvcnQgVmlld1x0XHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2NvbnRhaW5lcnMvVmlld1wiKTtcbmltcG9ydCBIb3ZlckNvbnRyb2xsZXJcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9jb250cm9sbGVycy9Ib3ZlckNvbnRyb2xsZXJcIik7XG5pbXBvcnQgRGlyZWN0aW9uYWxMaWdodFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2VudGl0aWVzL0RpcmVjdGlvbmFsTGlnaHRcIik7XG5pbXBvcnQgTWVzaFx0XHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2VudGl0aWVzL01lc2hcIik7XG5pbXBvcnQgTW91c2VFdmVudFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvZXZlbnRzL01vdXNlRXZlbnRcIik7XG5pbXBvcnQgU3RhdGljTGlnaHRQaWNrZXJcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvbWF0ZXJpYWxzL2xpZ2h0cGlja2Vycy9TdGF0aWNMaWdodFBpY2tlclwiKTtcblxuaW1wb3J0IERlZmF1bHRSZW5kZXJlclx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXJlbmRlcmVyZ2wvbGliL0RlZmF1bHRSZW5kZXJlclwiKTtcbmltcG9ydCBKU1BpY2tpbmdDb2xsaWRlclx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1yZW5kZXJlcmdsL2xpYi9waWNrL0pTUGlja2luZ0NvbGxpZGVyXCIpO1xuXG5pbXBvcnQgTWV0aG9kTWF0ZXJpYWxcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1tZXRob2RtYXRlcmlhbHMvbGliL01ldGhvZE1hdGVyaWFsXCIpO1xuaW1wb3J0IE1ldGhvZFJlbmRlcmVyUG9vbFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1tZXRob2RtYXRlcmlhbHMvbGliL3Bvb2wvTWV0aG9kUmVuZGVyZXJQb29sXCIpO1xuaW1wb3J0IEFXRFBhcnNlclx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtcGFyc2Vycy9saWIvQVdEUGFyc2VyXCIpO1xuXG5jbGFzcyBBV0RTdXphbm5lXG57XG5cblx0cHJpdmF0ZSBfcmVuZGVyZXI6RGVmYXVsdFJlbmRlcmVyO1xuXHRwcml2YXRlIF92aWV3OlZpZXc7XG5cdHByaXZhdGUgX3Rva2VuOkFzc2V0TG9hZGVyVG9rZW47XG5cdHByaXZhdGUgX3RpbWVyOlJlcXVlc3RBbmltYXRpb25GcmFtZTtcblx0cHJpdmF0ZSBfc3V6YW5lOk1lc2g7XG5cdHByaXZhdGUgX2xpZ2h0OkRpcmVjdGlvbmFsTGlnaHQ7XG5cdHByaXZhdGUgX2xpZ2h0UGlja2VyOlN0YXRpY0xpZ2h0UGlja2VyO1xuXHRwcml2YXRlIF9sb29rQXRQb3NpdGlvbjpWZWN0b3IzRCA9IG5ldyBWZWN0b3IzRCAoKTtcblx0cHJpdmF0ZSBfY2FtZXJhSW5jcmVtZW50Om51bWJlciA9IDA7XG5cdHByaXZhdGUgX21vdXNlT3Zlck1hdGVyaWFsOk1ldGhvZE1hdGVyaWFsID0gbmV3IE1ldGhvZE1hdGVyaWFsKDB4RkYwMDAwKTtcblx0cHJpdmF0ZSBfbW91c2VPdXRNYXRlcmlhbDpNZXRob2RNYXRlcmlhbDtcblxuXHRjb25zdHJ1Y3RvcigpXG5cdHtcblx0XHR0aGlzLmluaXRWaWV3KCk7XG5cdFx0dGhpcy5sb2FkQXNzZXRzKCk7XG5cdFx0dGhpcy5pbml0TGlnaHRzKCk7XG5cblx0XHR3aW5kb3cub25yZXNpemUgID0gKGV2ZW50OlVJRXZlbnQpID0+IHRoaXMub25SZXNpemUoZXZlbnQpO1xuXG5cdFx0dGhpcy5vblJlc2l6ZSgpO1xuXHR9XG5cblx0LyoqXG5cdCAqXG5cdCAqL1xuXHRwcml2YXRlIGluaXRWaWV3KCk6dm9pZFxuXHR7XG5cdFx0dGhpcy5fcmVuZGVyZXIgPSBuZXcgRGVmYXVsdFJlbmRlcmVyKE1ldGhvZFJlbmRlcmVyUG9vbClcblx0XHR0aGlzLl92aWV3ID0gbmV3IFZpZXcodGhpcy5fcmVuZGVyZXIpO1xuXHRcdHRoaXMuX3ZpZXcuY2FtZXJhLnByb2plY3Rpb24uZmFyID0gNjAwMDtcblx0XHR0aGlzLl92aWV3LmZvcmNlTW91c2VNb3ZlID0gdHJ1ZTtcblx0fVxuXG5cdC8qKlxuXHQgKlxuXHQgKi9cblx0cHJpdmF0ZSBsb2FkQXNzZXRzKCk6dm9pZFxuXHR7XG5cdFx0dGhpcy5fdGltZXIgPSBuZXcgUmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMucmVuZGVyLCB0aGlzKTtcblx0XHR0aGlzLl90aW1lci5zdGFydCgpO1xuXG5cdFx0QXNzZXRMaWJyYXJ5LmVuYWJsZVBhcnNlcihBV0RQYXJzZXIpO1xuXG5cdFx0dGhpcy5fdG9rZW4gPSBBc3NldExpYnJhcnkubG9hZChuZXcgVVJMUmVxdWVzdCgnYXNzZXRzL3N1emFubmUuYXdkJykpO1xuXHRcdHRoaXMuX3Rva2VuLmFkZEV2ZW50TGlzdGVuZXIoTG9hZGVyRXZlbnQuUkVTT1VSQ0VfQ09NUExFVEUsIChldmVudDpMb2FkZXJFdmVudCkgPT4gdGhpcy5vblJlc291cmNlQ29tcGxldGUoZXZlbnQpKTtcblx0fVxuXG5cdC8qKlxuXHQgKlxuXHQgKi9cblx0cHJpdmF0ZSBpbml0TGlnaHRzKCk6dm9pZFxuXHR7XG5cdFx0dGhpcy5fbGlnaHQgPSBuZXcgRGlyZWN0aW9uYWxMaWdodCgpO1xuXHRcdHRoaXMuX2xpZ2h0LmNvbG9yID0gMHg2ODMwMTk7XG5cdFx0dGhpcy5fbGlnaHQuZGlyZWN0aW9uID0gbmV3IFZlY3RvcjNEKDEsIDAsIDApO1xuXHRcdHRoaXMuX2xpZ2h0LmFtYmllbnQgPSAwLjE7XG5cdFx0dGhpcy5fbGlnaHQuYW1iaWVudENvbG9yID0gMHg4NWIyY2Q7XG5cdFx0dGhpcy5fbGlnaHQuZGlmZnVzZSA9IDIuODtcblx0XHR0aGlzLl9saWdodC5zcGVjdWxhciA9IDEuODtcblx0XHR0aGlzLl92aWV3LnNjZW5lLmFkZENoaWxkKHRoaXMuX2xpZ2h0KTtcblx0XHR0aGlzLl9saWdodFBpY2tlciA9IG5ldyBTdGF0aWNMaWdodFBpY2tlcihbdGhpcy5fbGlnaHRdKTtcblx0fVxuXG5cdC8qKlxuXHQgKlxuXHQgKi9cblx0cHJpdmF0ZSBvblJlc2l6ZShldmVudDpVSUV2ZW50ID0gbnVsbCk6dm9pZFxuXHR7XG5cdFx0dGhpcy5fdmlldy55ID0gMDtcblx0XHR0aGlzLl92aWV3LnggPSAwO1xuXHRcdHRoaXMuX3ZpZXcud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcblx0XHR0aGlzLl92aWV3LmhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcblx0fVxuXG5cdC8qKlxuXHQgKlxuXHQgKiBAcGFyYW0gZHRcblx0ICovXG5cdHByaXZhdGUgcmVuZGVyKGR0Om51bWJlcikgLy9hbmltYXRlIGJhc2VkIG9uIGR0IGZvciBmaXJlZm94XG5cdHtcblx0XHRpZiAodGhpcy5fdmlldy5jYW1lcmEpIHtcblx0XHRcdHRoaXMuX3ZpZXcuY2FtZXJhLmxvb2tBdCh0aGlzLl9sb29rQXRQb3NpdGlvbik7XG5cdFx0XHR0aGlzLl9jYW1lcmFJbmNyZW1lbnQgKz0gMC4wMTtcblx0XHRcdHRoaXMuX3ZpZXcuY2FtZXJhLnggPSBNYXRoLmNvcyh0aGlzLl9jYW1lcmFJbmNyZW1lbnQpKjE0MDA7XG5cdFx0XHR0aGlzLl92aWV3LmNhbWVyYS56ID0gTWF0aC5zaW4odGhpcy5fY2FtZXJhSW5jcmVtZW50KSoxNDAwO1xuXG5cdFx0XHR0aGlzLl9saWdodC54ID0gTWF0aC5jb3ModGhpcy5fY2FtZXJhSW5jcmVtZW50KSoxNDAwO1xuXHRcdFx0dGhpcy5fbGlnaHQueSA9IE1hdGguc2luKHRoaXMuX2NhbWVyYUluY3JlbWVudCkqMTQwMDtcblxuXHRcdH1cblxuXHRcdHRoaXMuX3ZpZXcucmVuZGVyKCk7XG5cdH1cblxuXHQvKipcblx0ICpcblx0ICogQHBhcmFtIGVcblx0ICovXG5cdHB1YmxpYyBvblJlc291cmNlQ29tcGxldGUoZTpMb2FkZXJFdmVudClcblx0e1xuXHRcdHZhciBsb2FkZXI6QXNzZXRMb2FkZXIgPSA8QXNzZXRMb2FkZXI+IGUudGFyZ2V0O1xuXHRcdHZhciBudW1Bc3NldHM6bnVtYmVyID0gbG9hZGVyLmJhc2VEZXBlbmRlbmN5LmFzc2V0cy5sZW5ndGg7XG5cblx0XHRmb3IgKHZhciBpOm51bWJlciA9IDA7IGkgPCBudW1Bc3NldHM7ICsraSkge1xuXHRcdFx0dmFyIGFzc2V0OklBc3NldCA9IGxvYWRlci5iYXNlRGVwZW5kZW5jeS5hc3NldHNbIGkgXTtcblxuXHRcdFx0c3dpdGNoKGFzc2V0LmFzc2V0VHlwZSkge1xuXHRcdFx0XHRjYXNlIEFzc2V0VHlwZS5NRVNIOlxuXG5cdFx0XHRcdFx0dmFyIG1lc2g6TWVzaCA9IDxNZXNoPiBhc3NldDtcblxuXHRcdFx0XHRcdHRoaXMuX3N1emFuZSA9IG1lc2g7XG5cdFx0XHRcdFx0KDxNZXRob2RNYXRlcmlhbD4gdGhpcy5fc3V6YW5lLm1hdGVyaWFsKS5saWdodFBpY2tlciA9IHRoaXMuX2xpZ2h0UGlja2VyO1xuXHRcdFx0XHRcdHRoaXMuX3N1emFuZS55ID0gLTEwMDtcblx0XHRcdFx0XHR0aGlzLl9tb3VzZU91dE1hdGVyaWFsID0gPE1ldGhvZE1hdGVyaWFsPiB0aGlzLl9zdXphbmUubWF0ZXJpYWw7XG5cblx0XHRcdFx0XHRmb3IgKHZhciBjOm51bWJlciA9IDA7IGMgPCA4MDsgYysrKSB7XG5cblx0XHRcdFx0XHRcdHZhciBjbG9uZTpNZXNoID0gPE1lc2g+IG1lc2guY2xvbmUoKTtcblx0XHRcdFx0XHRcdHZhciBzY2FsZTpudW1iZXIgPSB0aGlzLmdldFJhbmRvbSg1MCwgMjAwKTtcblx0XHRcdFx0XHRcdGNsb25lLnggPSB0aGlzLmdldFJhbmRvbSgtMjAwMCwgMjAwMCk7XG5cdFx0XHRcdFx0XHRjbG9uZS55ID0gdGhpcy5nZXRSYW5kb20oLTIwMDAsIDIwMDApO1xuXHRcdFx0XHRcdFx0Y2xvbmUueiA9IHRoaXMuZ2V0UmFuZG9tKC0yMDAwLCAyMDAwKTtcblx0XHRcdFx0XHRcdGNsb25lLnRyYW5zZm9ybS5zY2FsZSA9IG5ldyBWZWN0b3IzRChzY2FsZSwgc2NhbGUsIHNjYWxlKTtcblx0XHRcdFx0XHRcdGNsb25lLnJvdGF0aW9uWSA9IHRoaXMuZ2V0UmFuZG9tICgwLCAzNjApO1xuXHRcdFx0XHRcdFx0Y2xvbmUuYWRkRXZlbnRMaXN0ZW5lcihNb3VzZUV2ZW50Lk1PVVNFX09WRVIsIChldmVudDpNb3VzZUV2ZW50KSA9PiB0aGlzLm9uTW91c2VPdmVyKGV2ZW50KSk7XG5cdFx0XHRcdFx0XHRjbG9uZS5hZGRFdmVudExpc3RlbmVyKE1vdXNlRXZlbnQuTU9VU0VfT1VULCAoZXZlbnQ6TW91c2VFdmVudCkgPT4gdGhpcy5vbk1vdXNlT3V0KGV2ZW50KSk7XG5cdFx0XHRcdFx0XHR0aGlzLl92aWV3LnNjZW5lLmFkZENoaWxkKGNsb25lKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRtZXNoLnRyYW5zZm9ybS5zY2FsZSA9IG5ldyBWZWN0b3IzRCg1MDAsIDUwMCwgNTAwKTtcblx0XHRcdFx0XHRtZXNoLnBpY2tpbmdDb2xsaWRlciA9IG5ldyBKU1BpY2tpbmdDb2xsaWRlcih0aGlzLl9yZW5kZXJlci5zdGFnZSk7XG5cblx0XHRcdFx0XHRtZXNoLmFkZEV2ZW50TGlzdGVuZXIoTW91c2VFdmVudC5NT1VTRV9PVkVSLCAoZXZlbnQ6TW91c2VFdmVudCkgPT4gdGhpcy5vbk1vdXNlT3ZlcihldmVudCkpO1xuXHRcdFx0XHRcdG1lc2guYWRkRXZlbnRMaXN0ZW5lcihNb3VzZUV2ZW50Lk1PVVNFX09VVCwgKGV2ZW50Ok1vdXNlRXZlbnQpID0+IHRoaXMub25Nb3VzZU91dChldmVudCkpO1xuXHRcdFx0XHRcdHRoaXMuX3ZpZXcuc2NlbmUuYWRkQ2hpbGQobWVzaCk7XG5cblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRjYXNlIEFzc2V0VHlwZS5HRU9NRVRSWTpcblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRjYXNlIEFzc2V0VHlwZS5NQVRFUklBTDpcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIG9uTW91c2VPdmVyKGV2ZW50Ok1vdXNlRXZlbnQpXG5cdHtcblx0XHQoPE1lc2g+IGV2ZW50Lm9iamVjdCkubWF0ZXJpYWwgPSB0aGlzLl9tb3VzZU92ZXJNYXRlcmlhbDtcblxuXHRcdGNvbnNvbGUubG9nKFwibW91c2VvdmVyXCIpO1xuXHR9XG5cblx0cHJpdmF0ZSBvbk1vdXNlT3V0KGV2ZW50Ok1vdXNlRXZlbnQpXG5cdHtcblx0XHQoPE1lc2g+IGV2ZW50Lm9iamVjdCkubWF0ZXJpYWwgPSB0aGlzLl9tb3VzZU91dE1hdGVyaWFsO1xuXG5cdFx0Y29uc29sZS5sb2coXCJtb3VzZW91dFwiKTtcblx0fVxuXG5cdC8qKlxuXHQgKlxuXHQgKiBAcGFyYW0gbWluXG5cdCAqIEBwYXJhbSBtYXhcblx0ICogQHJldHVybnMge251bWJlcn1cblx0ICovXG5cdHByaXZhdGUgZ2V0UmFuZG9tKG1pbjpudW1iZXIsIG1heDpudW1iZXIpOm51bWJlclxuXHR7XG5cdFx0cmV0dXJuIE1hdGgucmFuZG9tKCkqKG1heCAtIG1pbikgKyBtaW47XG5cdH1cbn1cblxud2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uKClcbntcblx0bmV3IEFXRFN1emFubmUoKTtcbn1cblxuIl19