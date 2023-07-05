import './style.css'
import * as THREE from 'three'
import gsap from'gsap'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper.js'
import { PlaneBufferGeometry, SphereBufferGeometry } from 'three'


//Shadows we have to tell renderer to handle the shadow maps, we have to tell objects to cast shadow and receive shadow (in our case sphere should cast shadow and plane should recieve shadow)
//Then we have to tell lights to cast the shadow. Only three types of lights can handle shadows - 1) PointLight 2)DirectionalLight 3)SpotLight




// created a scene
const scene = new THREE.Scene()

// const axesHelper = new THREE.AxesHelper()
// scene.add(axesHelper)

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()

const doorColorTexture = textureLoader.load('/textures/door/color.jpg')
const doorAlphaTexture = textureLoader.load('/textures/door/alpha.jpg')
const doorAmbientOcclusionTexture = textureLoader.load('/textures/door/ambientOcclusion.jpg')
const doorHeightTexture = textureLoader.load('/textures/door/height.jpg')
const doorMetalnessTexture = textureLoader.load('/textures/door/metalness.jpg')
const doorNormalTexture = textureLoader.load('/textures/door/normal.jpg')
const doorRoughnessTexture = textureLoader.load('/textures/door/color.jpg')

const bricksColorTexture = textureLoader.load('/textures/bricks/color.jpg')
const bricksAmbientOcclusionTexture = textureLoader.load('/textures/bricks/ambientOcclusion.jpg')
const bricksNormalTexture = textureLoader.load('/textures/bricks/normal.jpg')
const bricksRoughnessTexture = textureLoader.load('/textures/bricks/color.jpg')

const grassColorTexture = textureLoader.load('/textures/grass/color.jpg')
const grassAmbientOcclusionTexture = textureLoader.load('/textures/grass/ambientOcclusion.jpg')
const grassNormalTexture = textureLoader.load('/textures/grass/normal.jpg')
const grassRoughnessTexture = textureLoader.load('/textures/grass/color.jpg')

grassColorTexture.repeat.set(8,8)
grassAmbientOcclusionTexture.repeat.set(8,8)
grassNormalTexture.repeat.set(8,8)
grassRoughnessTexture.repeat.set(8,8)

grassColorTexture.wrapS = THREE.RepeatWrapping
grassAmbientOcclusionTexture.wrapS = THREE.RepeatWrapping
grassNormalTexture.wrapS = THREE.RepeatWrapping
grassRoughnessTexture.wrapS = THREE.RepeatWrapping

grassColorTexture.wrapT = THREE.RepeatWrapping
grassAmbientOcclusionTexture.wrapT = THREE.RepeatWrapping
grassNormalTexture.wrapT = THREE.RepeatWrapping
grassRoughnessTexture.wrapT = THREE.RepeatWrapping

/**
 * Debug UI
 */
const gui = new dat.GUI()
// gui.hide()

/**
 * Objects
 */
const fog = new THREE.Fog('#262837', 1, 15)
scene.fog = fog


const house = new THREE.Group()
scene.add(house);

const walls = new THREE.Mesh(
    new THREE.BoxBufferGeometry(4,2.5,4),
    new THREE.MeshStandardMaterial({
        map: bricksColorTexture,
        aoMap: bricksAmbientOcclusionTexture,
        normalMap: bricksNormalTexture,
        roughnessMap: bricksRoughnessTexture
    })
)
walls.geometry.setAttribute('uv2', walls.geometry.attributes.uv)
walls.position.y = walls.geometry.parameters.height / 2
house.add(walls)

const roof = new THREE.Mesh(
    new THREE.ConeBufferGeometry(3,3,4),
    new THREE.MeshStandardMaterial({ color: '#b22222' })
)
roof.position.y = 2.5 + roof.geometry.parameters.height/2
roof.rotation.y = Math.PI * 0.25
house.add(roof)

const door = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(1.7,1.7,100,100),
    new THREE.MeshStandardMaterial({
        map: doorColorTexture,
        transparent: true,
        aoMap: doorAmbientOcclusionTexture,
        alphaMap: doorAlphaTexture,
        displacementMap: doorHeightTexture,
        displacementScale:0.1,
        normalMap: doorNormalTexture,
        metalnessMap: doorMetalnessTexture,
        roughnessMap: doorRoughnessTexture
    })
)
door.geometry.setAttribute('uv2',door.geometry.attributes.uv)
door.position.z = 2.01
door.position.y = door.geometry.parameters.height / 2
house.add(door)

//Bushes
const bushGeometry = new THREE.SphereBufferGeometry(1,16,16)
const bushMaterial = new THREE.MeshStandardMaterial({ color: '#89c854' })

const bush1 = new THREE.Mesh(bushGeometry, bushMaterial)
bush1.scale.set(0.5,0.5,0.5)
bush1.position.set(1,0.2,2.2)
house.add(bush1)

const bush2 = new THREE.Mesh(bushGeometry, bushMaterial)
bush2.scale.set(0.25,0.25,0.25)
bush2.position.set(1.4,0.1,2.1)
house.add(bush2)

const bush3 = new THREE.Mesh(bushGeometry, bushMaterial)
bush3.scale.set(0.4,0.4,0.4)
bush3.position.set(-0.8,0.1,2.2)
house.add(bush3)

const floor = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(20,20),
    new THREE.MeshStandardMaterial({
        map: grassColorTexture,
        aoMap: grassAmbientOcclusionTexture,
        normalMap: grassNormalTexture,
        roughnessMap: grassRoughnessTexture
    })
)

floor.geometry.setAttribute('uv2', floor.geometry.attributes.uv)
floor.rotation.x = - Math.PI * 0.5
floor.position.y = 0
scene.add(floor)

/**
 * Graves
 */
const graves = new THREE.Group()
scene.add(graves)

const graveGeometry =  new THREE.BoxBufferGeometry(0.6,0.8,0.2)
const graveMaterial = new THREE.MeshStandardMaterial({ color: '#b2b6b1' })

for(let i=0; i<50; i++){
    const randAngle = Math.random() * Math.PI * 2
    const randRadius = 3 + Math.random()*6
    const x = randRadius* Math.sin(randAngle)
    const z = randRadius* Math.cos(randAngle)

    const grave= new THREE.Mesh(graveGeometry, graveMaterial)
    grave.castShadow = true
    grave.position.set(x,0.3,z)
    grave.rotation.y = (Math.random() - 0.5) * 0.7
    grave.rotation.z = (Math.random() - 0.5) * 0.7
    graves.add(grave)


}

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight('#b9d5ff',0.18)
gui.add(ambientLight, 'intensity').min(0).max(1).step(0.001).name('Ambient Intensity')
scene.add(ambientLight)

const moonLight = new THREE.DirectionalLight('#b9d5ff', 0.18)
moonLight.position.set(4,5,-2)
gui.add(moonLight, 'intensity').min(0).max(1).step(0.001)
gui.add(moonLight.position, 'x').min(-5).max(5).step(0.01)
gui.add(moonLight.position, 'y').min(-5).max(5).step(0.01)
gui.add(moonLight.position, 'z').min(-5).max(5).step(0.01)
scene.add(moonLight)

const doorLight = new THREE.PointLight('#ff7d46', 1, 7)
doorLight.position.set(0,2.5,2.3)
house.add(doorLight)

/**
 * Ghosts
 */
const ghost1 = new THREE.PointLight('#ff00ff', 2, 3)
ghost1.position.y = -1
scene.add(ghost1)

const ghost2 = new THREE.PointLight('#00ffff', 2, 3)
scene.add(ghost2)

const ghost3 = new THREE.PointLight('#ffff00', 2, 3)
scene.add(ghost3)


// const doorLightHelper = new THREE.PointLightHelper(doorLight)
// scene.add(doorLightHelper)


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
const camera = new THREE.PerspectiveCamera(90, sizes.width / sizes.height, 0.1, 100) //75 here is the fov i.e. field of view
// const camera = new THREE.OrthographicCamera(-1*aspectRatio,1*aspectRatio,1,-1,0.1,100)
//right now the camera is at (0,0,0) i.e. inside our cube, we 
//can move it outside the cube by changing its position
camera.position.y = 3.5
camera.position.z = 9
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
renderer.setClearColor('#262837')

/**
 * Shadows
 */
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

doorLight.castShadow = true
ghost1.castShadow =true
ghost2.castShadow =true
ghost3.castShadow =true
moonLight.castShadow = true
floor.receiveShadow = true
bush1.castShadow = true
bush2.castShadow = true
bush3.castShadow = true
walls.castShadow = true

moonLight.shadow.mapSize.width = 256
moonLight.shadow.mapSize.height = 256
moonLight.shadow.camera.far = 7

ghost1.shadow.mapSize.width = 256
ghost1.shadow.mapSize.height = 256
ghost1.shadow.camera.far = 7

ghost2.shadow.mapSize.width = 256
ghost2.shadow.mapSize.height = 256
ghost2.shadow.camera.far = 7

ghost3.shadow.mapSize.width = 256
ghost3.shadow.mapSize.height = 256
ghost3.shadow.camera.far = 7

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

    //update objects

    //animate ghosts
    ghost1.position.x = Math.cos(elapsedTime) * 4
    ghost1.position.z = Math.sin(elapsedTime) * 4
    ghost1.position.y = Math.cos(elapsedTime * 3) 

    ghost2.position.x = Math.cos(-elapsedTime) * 6
    ghost2.position.z = Math.sin(-elapsedTime) * 6
    ghost2.position.y = Math.cos(-elapsedTime * 3) + Math.sin(elapsedTime * 0.65)

    ghost3.position.x = 3+ Math.cos(elapsedTime * 0.2) * (7 * Math.sin(elapsedTime * 0.2 * 3))
    ghost3.position.z = 3+ Math.sin(elapsedTime * 0.2) * (7 * Math.sin(elapsedTime * 0.2 * 3))
    ghost3.position.y = Math.cos(elapsedTime * 3) + Math.sin(elapsedTime * 0.65)
    
    //Update controls due to damping
    controls.update()

    // //moving or animating the object
    // cube.rotation.y = elapsedTime
    renderer.render(scene, camera)

    window.requestAnimationFrame(tick)
}

tick()
