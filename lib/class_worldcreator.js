function Worldcreator() {

    this.getRayCollission = (mouse) => {

        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1, 
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

        this.vector      = new THREE.Vector3(mouse.x, mouse.y, 1).unproject(renderer.camera); 
        this.ray         = new THREE.Raycaster(
                            renderer.camera.position, 
                            this.vector.sub(renderer.camera.position).normalize()); 

        this.ray.params.Points.threshold = 0.3;

        this.intersects  = this.ray.intersectObjects(renderer.world.children); 
        
        if (this.intersects.length > 0) {
            return this.intersects[0].point;
        } else {
            return false; 
        }
    }

    this.generateToolHandle = () => {

        this.handle = new THREE.TransformControls(renderer.camera, renderer.domElement);

        this.handle.setTranslationSnap(1);
        this.handle.addEventListener('dragging-changed', (event) => { 
            renderer.controls.enabled = ! event.value; 
        });

        renderer.renderlist["toolhandle"] = {uuid: this.handle.uuid};
        renderer.world.add(this.handle);
    }

    this.generateToolHandle();


    this.generateBrush = async () => {

        this.brush      = mapper.getObject("brush");
        this.position   = mapper.getObjectPosition("brush");

        if (this.brush) {
            this.handle.detach(this.brush);
            renderer.removeGeometry("brush");
        }

        this.dimensions     = tool.brush.dimensions;
        this.volumendata    = Array(this.dimensions[0] * this.dimensions[1] * this.dimensions[2]).fill(tool.brush.texture);
        
        renderer.generateMesh("brush", this.volumendata, this.dimensions, this.position, "brush");

    }
}