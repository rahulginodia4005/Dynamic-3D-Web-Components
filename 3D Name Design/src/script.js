import './style.css'
import * as THREE from 'three'
import gsap from'gsap'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'

// created a scene
const scene = new THREE.Scene()

// const axesHelper = new THREE.AxesHelper()
// scene.add(axesHelper)

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const matcapTexture = textureLoader.load('/textures/matcaps/1.png')

/**
 * Debug UI
 */
const gui = new dat.GUI()
// gui.hide()

/**
 * Fonts
 */
const fontLoader = new FontLoader()

fontLoader.load(
    '/fonts/helvetiker_regular.typeface.json',
    (font) => {
        const textGeometry = new TextGeometry(
            'Rahul Ginodia',
            {
                font: font,
                size: 0.5,
                height: 0.2,
                curveSegments: 5,
                bevelEnabled: true,
                bevelThickness: 0.03,
                bevelSize: 0.02,
                bevelOffset: 0,
                bevelSegments: 4
            }
        )
        // textGeometry.computeBoundingBox()
        // textGeometry.translate(
        //     - (textGeometry.boundingBox.max.x - 0.02) * 0.5 ,
        //     - (textGeometry.boundingBox.max.y - 0.02) * 0.5 ,
        //     - (textGeometry.boundingBox.max.z - 0.03) * 0.5
        // )
        textGeometry.center()
        
        const material = new THREE.MeshMatcapMaterial({matcap:matcapTexture})
        const text = new THREE.Mesh(textGeometry, material)
        scene.add(text)

        const torusGeometry = new THREE.TorusBufferGeometry(0.3,0.2,20,45)
        const torusMaterial = new THREE.MeshMatcapMaterial({matcap:matcapTexture})

        for(let i =0;i<100;i++){
            const torus = new THREE.Mesh(torusGeometry,torusMaterial)
            torus.position.x = (Math.random() - 0.5) * 10
            torus.position.y = (Math.random() - 0.5) * 10
            torus.position.z = (Math.random() - 0.5) * 10

            torus.rotation.x = Math.random() * Math.PI
            torus.rotation.y = Math.random() * Math.PI

            const scale = Math.random()
            torus.scale.set(scale,scale,scale)

            scene.add(torus)
        }

    }
)

const parameter = {
    color: '#ffffff',
    spin: () => {
        gsap.to(cube.rotation, {duration:1, y: cube.rotation.y + Math.PI * 2})
    }
}

/**
 Cursor
 */
const cursor = {
    x:0,
    y:0
}
window.addEventListener('mousemove', (event) => {
    cursor.x = (event.clientX / sizes.width) - 0.5
    cursor.y = -( (event.clientY / sizes.height) - 0.5)
})



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
camera.position.z = 3
// camera.position.x = 2
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
    canvas
})

//setting the size of the canvas to desired values
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(2,window.devicePixelRatio))

//render the scene and the camera
renderer.render(scene, camera)

//will be used to set the animation according to the fps
const clock = new THREE.Clock();

//Starting with the animations
//making a function tick that will request animations whenever we want
const tick = () => {
    // console.log('tick')

    //setting the rotation according to the fps
    const elapsedTime = clock.getElapsedTime();

    //Update controls due to damping
    controls.update()

    // //moving or animating the object
    // cube.rotation.y = elapsedTime
    renderer.render(scene, camera)

    window.requestAnimationFrame(tick)
}

tick()
