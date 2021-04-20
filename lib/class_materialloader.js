function Materialloader () {

    var materials = {
        17:   { main: { tex: '018', normal: 'empty_normal' }, top: { tex: '018', normal: 'empty_normal' }, descr: 'pipette', transparent: true, opacity: 0.5 },
        0:    { main: { tex: '000', normal: 'empty_normal' }, top: { tex: '000', normal: 'empty_normal' }, descr: 'air', transparent: true, opacity: 0.5 },
        1:    { main: { tex: '001', normal: 'empty_normal' }, top: { tex: '001', normal: 'empty_normal' }, descr: 'brick1', transparent: false, opacity: 1 },
        2:    { main: { tex: '002', normal: 'empty_normal' }, top: { tex: '002', normal: 'empty_normal' }, descr: 'brick2', transparent: false, opacity: 1 },
        3:    { main: { tex: '003', normal: 'empty_normal' }, top: { tex: '003', normal: 'empty_normal' }, descr: 'vegetation1', transparent: false, opacity: 1 },
        4:    { main: { tex: '006', normal: 'empty_normal' }, top: { tex: '006', normal: 'empty_normal' }, descr: 'vegetation2', transparent: false, opacity: 1 },
        5:    { main: { tex: '007', normal: 'empty_normal' }, top: { tex: '007', normal: 'empty_normal' }, descr: 'vegetation3', transparent: false, opacity: 1 },
        6:    { main: { tex: '008', normal: 'empty_normal' }, top: { tex: '008', normal: 'empty_normal' }, descr: 'vegetation4', transparent: false, opacity: 1 },
        7:    { main: { tex: '009', normal: 'empty_normal' }, top: { tex: '009', normal: 'empty_normal' }, descr: 'stone1', transparent: false, opacity: 1 },
        8:    { main: { tex: '010', normal: 'empty_normal' }, top: { tex: '010', normal: 'empty_normal' }, descr: 'stone2', transparent: false, opacity: 1 },
        9:    { main: { tex: '011', normal: 'empty_normal' }, top: { tex: '011', normal: 'empty_normal' }, descr: 'stone3', transparent: false, opacity: 1 },
        10:   { main: { tex: '012', normal: 'empty_normal' }, top: { tex: '012', normal: 'empty_normal' }, descr: 'mud1', transparent: false, opacity: 1 },
        11:   { main: { tex: '013', normal: 'empty_normal' }, top: { tex: '013', normal: 'empty_normal' }, descr: 'mud2', transparent: false, opacity: 1 },
        12:   { main: { tex: '014', normal: 'empty_normal' }, top: { tex: '014', normal: 'empty_normal' }, descr: 'mud3', transparent: false, opacity: 1 },
        13:   { main: { tex: '015', normal: 'empty_normal' }, top: { tex: '015', normal: 'empty_normal' }, descr: 'bricks1', transparent: false, opacity: 1 },
        14:   { main: { tex: '016', normal: 'empty_normal' }, top: { tex: '016', normal: 'empty_normal' }, descr: 'bricks2', transparent: false, opacity: 1 },
        15:   { main: { tex: '004', normal: 'empty_normal' }, top: { tex: '004', normal: 'empty_normal' }, descr: 'sand1', transparent: false, opacity: 1 },
        16:   { main: { tex: '005', normal: 'empty_normal' }, top: { tex: '005', normal: 'empty_normal' }, descr: 'sand2', transparent: false, opacity: 1 },
    };

    var dom_texture_container = document.getElementById('texturepool');

    //Todo: check if material exists
    this.loadmaterials = () => {

        for ( key in materials ) {

            renderer.loadedtextures[ key ] = renderer.textureloader.load( 'materials/' + materials[ key ].main.tex + '.png' );
            renderer.loadedtextures[ key ].wrapS = renderer.loadedtextures[ key ].wrapT = THREE.RepeatWrapping;
            renderer.loadedtextures[ key ].magFilter = THREE.NearestFilter;
            renderer.loadedtextures[ key ].minFilter = THREE.LinearMipMapLinearFilter;

            renderer.loadedtextures[ key + '_normal'] = renderer.textureloader.load( 'materials/' + materials[ key ].main.normal + '.png' );
            renderer.loadedtextures[ key + '_normal'].wrapS = renderer.loadedtextures[ key + '_normal'].wrapT = THREE.RepeatWrapping;
            renderer.loadedtextures[ key + '_normal'].magFilter = THREE.NearestFilter;
            renderer.loadedtextures[ key + '_normal'].minFilter = THREE.LinearMipMapLinearFilter;

            renderer.materials[ key ] = new THREE.MeshPhongMaterial( {
                map: renderer.loadedtextures[ key ],
                normalMap: renderer.loadedtextures[ key + '_normal' ],
                color: 0xffffff,
                specular: 0x050505,
                shininess: 35,
                opacity: materials[key].opacity,
                transparent: materials[key].transparent,
                normalScale: new THREE.Vector2( 0.1, 0.1 )
            } );

            renderer.loadedtextures[ key + '_top' ] = renderer.textureloader.load( 'materials/' + materials[ key ].top.tex + '.png' );
            renderer.loadedtextures[ key + '_top' ].wrapS = renderer.loadedtextures[ key + '_top' ].wrapT = THREE.RepeatWrapping;
            renderer.loadedtextures[ key + '_top' ].magFilter = THREE.NearestFilter;
            renderer.loadedtextures[ key + '_top' ].minFilter = THREE.LinearMipMapLinearFilter;

            renderer.loadedtextures[ key + '_top_normal' ] = renderer.textureloader.load( 'materials/' + materials[ key ].top.normal + '.png' );
            renderer.loadedtextures[ key + '_top_normal' ].wrapS = renderer.loadedtextures[ key + '_top_normal' ].wrapT = THREE.RepeatWrapping;
            renderer.loadedtextures[ key + '_top_normal' ].magFilter = THREE.NearestFilter;
            renderer.loadedtextures[ key + '_top_normal' ].minFilter = THREE.LinearMipMapLinearFilter;

            renderer.materials[ key + '_top' ] = new THREE.MeshPhongMaterial( {
                map: renderer.loadedtextures[ key + '_top' ],
                normalMap: renderer.loadedtextures[ key + '_top_normal' ],
                color: 0xffffff,
                specular: 0x050505,
                shininess: 35,
                opacity: materials[key].opacity,
                transparent: materials[key].transparent,
                normalScale: new THREE.Vector2( 0.1, 0.1 )
            } );

            dom_texture_container.innerHTML += '<div id="texture' + key +'" class="texturesample" style="background-image: url(\'materials/' + materials[key].top.tex + '.png\');" onclick="gui.geometry_change_texture(' + key + ');"></div>';
        }
        dom_texture_container.innerHTML += '<div style="clear: both;"></div>';
    }

    this.loadmaterials();
}