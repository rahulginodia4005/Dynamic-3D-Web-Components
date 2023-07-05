import './style.css'
import * as THREE from 'three'
import gsap from'gsap'
import * as dat from 'dat.gui'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { DoubleSide } from 'three'
import overlayVertex from './shaders/overlay/vertex.glsl'
import overlayFragment from './shaders/overlay/fragment.glsl'


// created a scene
const scene = new THREE.Scene()

/**
 * Plane Overlay
 */
const overlayGeometry = new THREE.PlaneBufferGeometry(2,2,1,1)
const overlayMaterial = new THREE.ShaderMaterial({
    transparent: true,
    side: DoubleSide,
    uniforms: {
        uAlpha: {value: 1.0}
    },
    vertexShader: overlayVertex,
    fragmentShader: overlayFragment
})
const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial)
scene.add(overlay)

/**
 * Update all the materials
 */
const updateAllMaterials = () => {
    scene.traverse((child) => {
        if(child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
            child.material.envMap = environmentMap
            child.material.envMapIntensity = debugObject.envMapIntensity
            child.material.needsUpdate = true
            child.castShadow = true
            child.receiveShadow = true
        }
    })
}

const loadingBarQuery = document.querySelector('.loading-bar')
/**
 * Loading Manager
 */
const loadingManager = new THREE.LoadingManager(

    //Loaded
    () => {
        gsap.delayedCall(0.5, () => {
            gsap.to(overlayMaterial.uniforms.uAlpha, {duration: 3.0, value: 0 })
            loadingBarQuery.classList.add('ended')
            loadingBarQuery.style.transform = '';
        })
    },

    //Progress
    (url, itemsLoaded, itemsTotal) => {
        const fraction = itemsLoaded/ itemsTotal
        loadingBarQuery.style.transform = "scaleX(" + fraction + ")";
    }

)

const dracoLoader = new DRACOLoader(loadingManager)
dracoLoader.setDecoderPath('/draco/')

const gltfLoader = new GLTFLoader(loadingManager)
gltfLoader.setDRACOLoader(dracoLoader)

gltfLoader.load(
    '/models/hamburger.glb',
    (gltf) => {
        gltf.scene.scale.set(0.3,0.3,0.3)
        gltf.scene.position.set(0,0,0)
        gltf.scene.rotation.y = Math.PI * 0.5
        scene.add(gltf.scene)

        gui.add(gltf.scene.rotation, 'y').min(-Math.PI).max(Math.PI).step(0.001).name('rotateHelmet')

        updateAllMaterials()
    }
)

const cubeTextureLoader = new THREE.CubeTextureLoader(loadingManager)

// const axesHelper = new THREE.AxesHelper()
// scene.add(axesHelper)

/**
 * Debug UI
 */
const gui = new dat.GUI({width: 400})
// gui.hide()
    


/**
 * Objects
 */

const environmentMap = cubeTextureLoader.load([
    '/textures/environmentMaps/0/px.jpg',
    '/textures/environmentMaps/0/nx.jpg',
    '/textures/environmentMaps/0/py.jpg',
    '/textures/environmentMaps/0/ny.jpg',
    '/textures/environmentMaps/0/pz.jpg',
    '/textures/environmentMaps/0/nz.jpg'
])
environmentMap.encoding = THREE.sRGBEncoding

scene.background = environmentMap

// scene.environment = environmentMap   //for applying the env map to every element that supports it

const debugObject = {
    envMapIntensity: 5
}

gui.add(debugObject, 'envMapIntensity', 0, 10, 0.01).onChange(updateAllMaterials)

/**
 * Points of interest
 */
const points = [
    {
        position: new THREE.Vector3(1.55,0.3,-0.6),
        element: document.querySelector('.point-0')
    }
]

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight(0xffffff, 3)
directionalLight.position.set(0.25,3,-2.25)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024,1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.normalBias = 0.05 //used to prevent flat surfaces forming shadow on themselves and giving a weird look
scene.add(directionalLight)


gui.add(directionalLight, 'intensity').min(0).max(10).step(0.01).name('lightIntensity')
gui.add(directionalLight.position, 'x').min(-5).max(5).step(0.01).name('lightX')
gui.add(directionalLight.position, 'y').min(-5).max(5).step(0.01).name('lightY')
gui.add(directionalLight.position, 'z').min(-5).max(5).step(0.01).name('lightZ')


//creating a size for the camera for its aspect ratio
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    //update the sizes according to the new resized window 
    sizes.width = innerWidth
    sizes.height = innerHeight

    //update the camera with the new aspect ratio
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix()

    //update the canvas too with the help of renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(2,window.devicePixelRatio))
})

window.addEventListener('dblclick', () => {
    if(!document.fullscreenElement){
        canvas.requestFullscreen()
    }
    else{
        document.exitFullscreen()
    }
})


//creating a camera for the view
const aspectRatio = sizes.width / sizes.height;
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100) //75 here is the fov i.e. field of view
// const camera = new THREE.OrthographicCamera(-1*aspectRatio,1*aspectRatio,1,-1,0.1,100)
//right now the camera is at (0,0,0) i.e. inside our cube, we 
//can move it outside the cube by changing its position
camera.position.x = -8
camera.position.y = 4
camera.position.z = -8
// camera.position.y = 2
// camera.lookAt(cube.position)

/**
lookAt function can be used for the camera object to look at any other object's Vector3
*/
// camera.lookAt(mesh.position)
//adding camera also to the scene
const canvas = document.querySelector('canvas.webgl')
scene.add(camera)
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true;

//creating a renderer that is useful for the camera to add it to the canvas
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true //used to prevent the jaggie effect on the edges; it divides one pixel into 4 pixels that are present on the geometry
})

//setting the size of the canvas to desired values
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(2,window.devicePixelRatio))
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.physicallyCorrectLights = true
renderer.outputEncoding = THREE.sRGBEncoding

renderer.toneMapping = THREE.ReinhardToneMapping

gui.add(renderer, 'toneMapping', {
    No : THREE.NoToneMapping,
    Linear : THREE.LinearToneMapping,
    Reinhard : THREE.ReinhardToneMapping,
    Cineon : THREE.CineonToneMapping,
    ACESFilmic : THREE.ACESFilmicToneMapping
}).onFinishChange(()=> {
    renderer.toneMapping = Number(renderer.toneMapping)
    updateAllMaterials()
})

gui.add(renderer, 'toneMappingExposure', 0, 5, 0.01)

//render the scene and the camera
// renderer.render(scene, camera)


//will be used to set the animation according to the fps
const clock = new THREE.Clock();
let oldElapsedTime = 0

//Starting with the animations
//making a function tick that will request animations whenever we want
const tick = () => {
    // console.log('tick')

    //setting the rotation according to the fps
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - oldElapsedTime
    oldElapsedTime = elapsedTime

    //animate
    for(const point of points) {
        const screenPosition = point.position.clone()
        screenPosition.project(camera)
    }

    

    //animate objects
    
    // Update controls
    controls.update()

    renderer.render(scene, camera)

    window.requestAnimationFrame(tick)
}

tick()
