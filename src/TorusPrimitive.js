var AwayEvent = require("awayjs-core/lib/events/Event");
var URLLoader = require("awayjs-core/lib/net/URLLoader");
var URLLoaderDataFormat = require("awayjs-core/lib/net/URLLoaderDataFormat");
var URLRequest = require("awayjs-core/lib/net/URLRequest");
var ParserUtils = require("awayjs-core/lib/parsers/ParserUtils");
var ImageTexture = require("awayjs-core/lib/textures/ImageTexture");
var RequestAnimationFrame = require("awayjs-core/lib/utils/RequestAnimationFrame");
var View = require("awayjs-display/lib/containers/View");
var DirectionalLight = require("awayjs-display/lib/entities/DirectionalLight");
var PrimitiveTorusPrefab = require("awayjs-display/lib/prefabs/PrimitiveTorusPrefab");
var StaticLightPicker = require("awayjs-display/lib/materials/lightpickers/StaticLightPicker");
var DefaultRenderer = require("awayjs-renderergl/lib/DefaultRenderer");
var MethodMaterial = require("awayjs-methodmaterials/lib/MethodMaterial");
var MethodRendererPool = require("awayjs-methodmaterials/lib/pool/MethodRendererPool");
var TorusPrimitive = (function () {
    function TorusPrimitive() {
        var _this = this;
        this.initView();
        this._raf = new RequestAnimationFrame(this.render, this);
        this._raf.start();
        this.loadResources();
        window.onresize = function (event) { return _this.onResize(event); };
        this.onResize();
    }
    /**
     *
     */
    TorusPrimitive.prototype.initView = function () {
        this._view = new View(new DefaultRenderer(MethodRendererPool)); // Create the Away3D View
        this._view.backgroundColor = 0x000000; // Change the background color to black
    };
    /**
     *
     */
    TorusPrimitive.prototype.loadResources = function () {
        var _this = this;
        var imgLoader = new URLLoader();
        imgLoader.dataFormat = URLLoaderDataFormat.BLOB;
        imgLoader.addEventListener(AwayEvent.COMPLETE, function (event) { return _this.urlCompleteHandler(event); });
        imgLoader.load(new URLRequest("assets/dots.png"));
    };
    /**
     *
     * @param event
     */
    TorusPrimitive.prototype.urlCompleteHandler = function (event) {
        var _this = this;
        this._image = ParserUtils.blobToImage(event.target.data);
        this._image.onload = function (event) { return _this.imageCompleteHandler(event); };
    };
    /**
     *
     */
    TorusPrimitive.prototype.initLights = function () {
        this._light = new DirectionalLight();
        this._light.diffuse = .7;
        this._light.specular = 1;
        this._view.scene.addChild(this._light);
        this._lightPicker = new StaticLightPicker([this._light]);
    };
    /**
     *
     */
    TorusPrimitive.prototype.initMaterial = function (image) {
        this._texture = new ImageTexture(image, false);
        this._material = new MethodMaterial(this._texture, true, true, false);
        this._material.lightPicker = this._lightPicker;
    };
    /**
     *
     */
    TorusPrimitive.prototype.initTorus = function () {
        this._torus = new PrimitiveTorusPrefab(220, 80, 32, 16, false);
        this._mesh = this._torus.getNewObject();
        this._mesh.material = this._material;
        this._view.scene.addChild(this._mesh);
    };
    /**
     *
     */
    TorusPrimitive.prototype.imageCompleteHandler = function (event) {
        this.initLights();
        this.initMaterial(event.target);
        this.initTorus();
    };
    /**
     *
     */
    TorusPrimitive.prototype.render = function (dt) {
        if (dt === void 0) { dt = null; }
        if (this._mesh)
            this._mesh.rotationY += 1;
        this._view.render();
    };
    /**
     *
     */
    TorusPrimitive.prototype.onResize = function (event) {
        if (event === void 0) { event = null; }
        this._view.y = 0;
        this._view.x = 0;
        this._view.width = window.innerWidth;
        this._view.height = window.innerHeight;
    };
    return TorusPrimitive;
})();
window.onload = function () {
    new TorusPrimitive();
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9Ub3J1c1ByaW1pdGl2ZS50cyJdLCJuYW1lcyI6WyJUb3J1c1ByaW1pdGl2ZSIsIlRvcnVzUHJpbWl0aXZlLmNvbnN0cnVjdG9yIiwiVG9ydXNQcmltaXRpdmUuaW5pdFZpZXciLCJUb3J1c1ByaW1pdGl2ZS5sb2FkUmVzb3VyY2VzIiwiVG9ydXNQcmltaXRpdmUudXJsQ29tcGxldGVIYW5kbGVyIiwiVG9ydXNQcmltaXRpdmUuaW5pdExpZ2h0cyIsIlRvcnVzUHJpbWl0aXZlLmluaXRNYXRlcmlhbCIsIlRvcnVzUHJpbWl0aXZlLmluaXRUb3J1cyIsIlRvcnVzUHJpbWl0aXZlLmltYWdlQ29tcGxldGVIYW5kbGVyIiwiVG9ydXNQcmltaXRpdmUucmVuZGVyIiwiVG9ydXNQcmltaXRpdmUub25SZXNpemUiXSwibWFwcGluZ3MiOiJBQUFBLElBQU8sU0FBUyxXQUFlLDhCQUE4QixDQUFDLENBQUM7QUFJL0QsSUFBTyxTQUFTLFdBQWUsK0JBQStCLENBQUMsQ0FBQztBQUNoRSxJQUFPLG1CQUFtQixXQUFhLHlDQUF5QyxDQUFDLENBQUM7QUFDbEYsSUFBTyxVQUFVLFdBQWUsZ0NBQWdDLENBQUMsQ0FBQztBQUNsRSxJQUFPLFdBQVcsV0FBZSxxQ0FBcUMsQ0FBQyxDQUFDO0FBRXhFLElBQU8sWUFBWSxXQUFlLHVDQUF1QyxDQUFDLENBQUM7QUFDM0UsSUFBTyxxQkFBcUIsV0FBWSw2Q0FBNkMsQ0FBQyxDQUFDO0FBRXZGLElBQU8sSUFBSSxXQUFpQixvQ0FBb0MsQ0FBQyxDQUFDO0FBQ2xFLElBQU8sZ0JBQWdCLFdBQWMsOENBQThDLENBQUMsQ0FBQztBQUdyRixJQUFPLG9CQUFvQixXQUFhLGlEQUFpRCxDQUFDLENBQUM7QUFDM0YsSUFBTyxpQkFBaUIsV0FBYSw2REFBNkQsQ0FBQyxDQUFDO0FBRXBHLElBQU8sZUFBZSxXQUFjLHVDQUF1QyxDQUFDLENBQUM7QUFFN0UsSUFBTyxjQUFjLFdBQWMsMkNBQTJDLENBQUMsQ0FBQztBQUNoRixJQUFPLGtC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QWdCQSxHQUFoQkEsU0FBZ0JBO1FBRTdCQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQTtZQUNkQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxTQUFTQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUUzQkEsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0E7SUFDckJBLENBQUNBO0lBRURUOztPQUVHQTtJQUNJQSxpQ0FBUUEsR0FBZkEsVUFBZ0JBLEtBQW9CQTtRQUFwQlUscUJBQW9CQSxHQUFwQkEsWUFBb0JBO1FBRW5DQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtRQUNqQkEsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7UUFDakJBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLEtBQUtBLEdBQUdBLE1BQU1BLENBQUNBLFVBQVVBLENBQUNBO1FBQ3JDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxHQUFHQSxNQUFNQSxDQUFDQSxXQUFXQSxDQUFDQTtJQUN4Q0EsQ0FBQ0E7SUFDRlYscUJBQUNBO0FBQURBLENBM0hBLEFBMkhDQSxJQUFBO0FBRUQsTUFBTSxDQUFDLE1BQU0sR0FBRztJQUVmLElBQUksY0FBYyxFQUFFLENBQUM7QUFDdEIsQ0FBQyxDQUFBIiwiZmlsZSI6IlRvcnVzUHJpbWl0aXZlLmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEF3YXlFdmVudFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvZXZlbnRzL0V2ZW50XCIpO1xuaW1wb3J0IExvYWRlckV2ZW50XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9ldmVudHMvTG9hZGVyRXZlbnRcIik7XG5pbXBvcnQgVmVjdG9yM0RcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvZ2VvbS9WZWN0b3IzRFwiKTtcbmltcG9ydCBBc3NldExpYnJhcnlcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2xpYnJhcnkvQXNzZXRMaWJyYXJ5XCIpO1xuaW1wb3J0IFVSTExvYWRlclx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvbmV0L1VSTExvYWRlclwiKTtcbmltcG9ydCBVUkxMb2FkZXJEYXRhRm9ybWF0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL25ldC9VUkxMb2FkZXJEYXRhRm9ybWF0XCIpO1xuaW1wb3J0IFVSTFJlcXVlc3RcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL25ldC9VUkxSZXF1ZXN0XCIpO1xuaW1wb3J0IFBhcnNlclV0aWxzXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9wYXJzZXJzL1BhcnNlclV0aWxzXCIpO1xuaW1wb3J0IFBlcnNwZWN0aXZlUHJvamVjdGlvblx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvcHJvamVjdGlvbnMvUGVyc3BlY3RpdmVQcm9qZWN0aW9uXCIpO1xuaW1wb3J0IEltYWdlVGV4dHVyZVx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvdGV4dHVyZXMvSW1hZ2VUZXh0dXJlXCIpO1xuaW1wb3J0IFJlcXVlc3RBbmltYXRpb25GcmFtZVx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvdXRpbHMvUmVxdWVzdEFuaW1hdGlvbkZyYW1lXCIpO1xuXG5pbXBvcnQgVmlld1x0XHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2NvbnRhaW5lcnMvVmlld1wiKTtcbmltcG9ydCBEaXJlY3Rpb25hbExpZ2h0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvZW50aXRpZXMvRGlyZWN0aW9uYWxMaWdodFwiKTtcbmltcG9ydCBNZXNoXHRcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvZW50aXRpZXMvTWVzaFwiKTtcbmltcG9ydCBTa3lib3hcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvZW50aXRpZXMvU2t5Ym94XCIpO1xuaW1wb3J0IFByaW1pdGl2ZVRvcnVzUHJlZmFiXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL3ByZWZhYnMvUHJpbWl0aXZlVG9ydXNQcmVmYWJcIik7XG5pbXBvcnQgU3RhdGljTGlnaHRQaWNrZXJcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvbWF0ZXJpYWxzL2xpZ2h0cGlja2Vycy9TdGF0aWNMaWdodFBpY2tlclwiKTtcblxuaW1wb3J0IERlZmF1bHRSZW5kZXJlclx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXJlbmRlcmVyZ2wvbGliL0RlZmF1bHRSZW5kZXJlclwiKTtcblxuaW1wb3J0IE1ldGhvZE1hdGVyaWFsXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtbWV0aG9kbWF0ZXJpYWxzL2xpYi9NZXRob2RNYXRlcmlhbFwiKTtcbmltcG9ydCBNZXRob2RSZW5kZXJlclBvb2xcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtbWV0aG9kbWF0ZXJpYWxzL2xpYi9wb29sL01ldGhvZFJlbmRlcmVyUG9vbFwiKTtcblxuY2xhc3MgVG9ydXNQcmltaXRpdmVcbntcblx0cHJpdmF0ZSBfdmlldzpWaWV3O1xuXHRwcml2YXRlIF90b3J1czpQcmltaXRpdmVUb3J1c1ByZWZhYjtcblx0cHJpdmF0ZSBfbWVzaDpNZXNoO1xuXHRwcml2YXRlIF9yYWY6UmVxdWVzdEFuaW1hdGlvbkZyYW1lO1xuXHRwcml2YXRlIF9pbWFnZTpIVE1MSW1hZ2VFbGVtZW50O1xuXHRwcml2YXRlIF90ZXh0dXJlOkltYWdlVGV4dHVyZTtcblx0cHJpdmF0ZSBfbWF0ZXJpYWw6TWV0aG9kTWF0ZXJpYWw7XG5cdHByaXZhdGUgX2xpZ2h0OkRpcmVjdGlvbmFsTGlnaHQ7XG5cdHByaXZhdGUgX2xpZ2h0UGlja2VyOlN0YXRpY0xpZ2h0UGlja2VyO1xuXG5cdGNvbnN0cnVjdG9yICgpXG5cdHtcblx0XHR0aGlzLmluaXRWaWV3KCk7XG5cblx0XHR0aGlzLl9yYWYgPSBuZXcgUmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMucmVuZGVyLCB0aGlzKTtcblx0XHR0aGlzLl9yYWYuc3RhcnQoKTtcblxuXHRcdHRoaXMubG9hZFJlc291cmNlcygpO1xuXHRcdHdpbmRvdy5vbnJlc2l6ZSA9IChldmVudDpVSUV2ZW50KSA9PiB0aGlzLm9uUmVzaXplKGV2ZW50KTtcblxuXHRcdHRoaXMub25SZXNpemUoKTtcblx0fVxuXG5cdC8qKlxuXHQgKlxuXHQgKi9cblx0cHJpdmF0ZSBpbml0VmlldygpXG5cdHtcblx0XHR0aGlzLl92aWV3ID0gbmV3IFZpZXcobmV3IERlZmF1bHRSZW5kZXJlcihNZXRob2RSZW5kZXJlclBvb2wpKTsvLyBDcmVhdGUgdGhlIEF3YXkzRCBWaWV3XG5cdFx0dGhpcy5fdmlldy5iYWNrZ3JvdW5kQ29sb3IgPSAweDAwMDAwMDsvLyBDaGFuZ2UgdGhlIGJhY2tncm91bmQgY29sb3IgdG8gYmxhY2tcblx0fVxuXG5cdC8qKlxuXHQgKlxuXHQgKi9cblx0cHJpdmF0ZSBsb2FkUmVzb3VyY2VzKClcblx0e1xuXHRcdHZhciBpbWdMb2FkZXI6VVJMTG9hZGVyID0gbmV3IFVSTExvYWRlcigpO1xuXHRcdGltZ0xvYWRlci5kYXRhRm9ybWF0ID0gVVJMTG9hZGVyRGF0YUZvcm1hdC5CTE9CO1xuXHRcdGltZ0xvYWRlci5hZGRFdmVudExpc3RlbmVyKEF3YXlFdmVudC5DT01QTEVURSwgKGV2ZW50OkF3YXlFdmVudCkgPT4gdGhpcy51cmxDb21wbGV0ZUhhbmRsZXIoZXZlbnQpKTtcblx0XHRpbWdMb2FkZXIubG9hZChuZXcgVVJMUmVxdWVzdChcImFzc2V0cy9kb3RzLnBuZ1wiKSk7XG5cdH1cblxuXHQvKipcblx0ICpcblx0ICogQHBhcmFtIGV2ZW50XG5cdCAqL1xuXHRwcml2YXRlIHVybENvbXBsZXRlSGFuZGxlciAoZXZlbnQ6QXdheUV2ZW50KVxuXHR7XG5cdFx0dGhpcy5faW1hZ2UgPSBQYXJzZXJVdGlscy5ibG9iVG9JbWFnZSgoPFVSTExvYWRlcj4gZXZlbnQudGFyZ2V0KS5kYXRhKTtcblx0XHR0aGlzLl9pbWFnZS5vbmxvYWQgPSAoZXZlbnQ6RXZlbnQpID0+IHRoaXMuaW1hZ2VDb21wbGV0ZUhhbmRsZXIoZXZlbnQpO1xuXHR9XG5cblx0LyoqXG5cdCAqXG5cdCAqL1xuXHRwcml2YXRlIGluaXRMaWdodHMoKVxuXHR7XG5cdFx0dGhpcy5fbGlnaHQgPSBuZXcgRGlyZWN0aW9uYWxMaWdodCgpO1xuXHRcdHRoaXMuX2xpZ2h0LmRpZmZ1c2UgPSAuNztcblx0XHR0aGlzLl9saWdodC5zcGVjdWxhciA9IDE7XG5cdFx0dGhpcy5fdmlldy5zY2VuZS5hZGRDaGlsZCh0aGlzLl9saWdodCk7XG5cblx0XHR0aGlzLl9saWdodFBpY2tlciA9IG5ldyBTdGF0aWNMaWdodFBpY2tlcihbdGhpcy5fbGlnaHRdKTtcblx0fVxuXG5cdC8qKlxuXHQgKlxuXHQgKi9cblx0cHJpdmF0ZSBpbml0TWF0ZXJpYWwoaW1hZ2U6SFRNTEltYWdlRWxlbWVudClcblx0e1xuXHRcdHRoaXMuX3RleHR1cmUgPSBuZXcgSW1hZ2VUZXh0dXJlKGltYWdlLCBmYWxzZSk7XG5cblx0XHR0aGlzLl9tYXRlcmlhbCA9IG5ldyBNZXRob2RNYXRlcmlhbCAodGhpcy5fdGV4dHVyZSwgdHJ1ZSwgdHJ1ZSwgZmFsc2UpO1xuXHRcdHRoaXMuX21hdGVyaWFsLmxpZ2h0UGlja2VyID0gdGhpcy5fbGlnaHRQaWNrZXI7XG5cdH1cblxuXHQvKipcblx0ICpcblx0ICovXG5cdHByaXZhdGUgaW5pdFRvcnVzKClcblx0e1xuXHRcdHRoaXMuX3RvcnVzID0gbmV3IFByaW1pdGl2ZVRvcnVzUHJlZmFiKDIyMCwgODAsIDMyLCAxNiwgZmFsc2UpO1xuXG5cdFx0dGhpcy5fbWVzaCA9IDxNZXNoPiB0aGlzLl90b3J1cy5nZXROZXdPYmplY3QoKTtcblx0XHR0aGlzLl9tZXNoLm1hdGVyaWFsID0gdGhpcy5fbWF0ZXJpYWw7XG5cblx0XHR0aGlzLl92aWV3LnNjZW5lLmFkZENoaWxkKHRoaXMuX21lc2gpO1xuXHR9XG5cblx0LyoqXG5cdCAqXG5cdCAqL1xuXHRwcml2YXRlIGltYWdlQ29tcGxldGVIYW5kbGVyKGV2ZW50OkV2ZW50KVxuXHR7XG5cdFx0dGhpcy5pbml0TGlnaHRzICgpO1xuXHRcdHRoaXMuaW5pdE1hdGVyaWFsKDxIVE1MSW1hZ2VFbGVtZW50PiBldmVudC50YXJnZXQpO1xuXHRcdHRoaXMuaW5pdFRvcnVzICgpO1xuXHR9XG5cblx0LyoqXG5cdCAqXG5cdCAqL1xuXHRwdWJsaWMgcmVuZGVyKGR0Om51bWJlciA9IG51bGwpXG5cdHtcblx0XHRpZiAodGhpcy5fbWVzaClcblx0XHRcdHRoaXMuX21lc2gucm90YXRpb25ZICs9IDE7XG5cblx0XHR0aGlzLl92aWV3LnJlbmRlcigpO1xuXHR9XG5cblx0LyoqXG5cdCAqXG5cdCAqL1xuXHRwdWJsaWMgb25SZXNpemUoZXZlbnQ6VUlFdmVudCA9IG51bGwpXG5cdHtcblx0XHR0aGlzLl92aWV3LnkgPSAwO1xuXHRcdHRoaXMuX3ZpZXcueCA9IDA7XG5cdFx0dGhpcy5fdmlldy53aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoO1xuXHRcdHRoaXMuX3ZpZXcuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xuXHR9XG59XG5cbndpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbigpXG57XG5cdG5ldyBUb3J1c1ByaW1pdGl2ZSgpO1xufSJdfQ==