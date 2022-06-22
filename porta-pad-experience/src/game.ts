log("started box  ")

class RotatorSystem {
  // this group will contain every entity that has a Transform component
  group = engine.getComponentGroup(Transform)

  update(dt: number) {
    // iterate over the entities of the group
    for (const entity of this.group.entities) {
      // get the Transform component of the entity
      const transform = entity.getComponent(Transform)

      // mutate the rotation
      transform.rotate(Vector3.Up(), dt * 10)
    }
  }
}

// Add a new instance of the system to the engine
engine.addSystem(new RotatorSystem())

const input = Input.instance

let started = false
let forwardVector = new Vector3()
const camera = Camera.instance

const box = new Entity()
box.addComponent( new BoxShape() )
box.addComponent( new Transform({position:new Vector3(2,.5,2),scale:new Vector3(2,.5,2)}))
engine.addEntity(box)

log("added box  ")

input.subscribe("BUTTON_DOWN", ActionButton.POINTER, true, (e) => {
  if(!started){
    started = true
    engine.addSystem(lerps)
  }
})

input.subscribe("BUTTON_UP", ActionButton.POINTER, true, (e) => {
  engine.removeSystem(lerps)
  started = false
})

@Component("lerpData")
export class LerpData {
  origin: Vector3 = Vector3.Zero()
  target: Vector3 = Vector3.Zero()
  fraction: number = 0
}

// a system to carry out the movement
export class LerpMove implements ISystem {
  update(dt: number) {
    forwardVector = Vector3.Forward().rotate(Camera.instance.rotation)
    let temp = camera.position.add( forwardVector.normalize().scale(5))
  
    box.getComponent(LerpData).origin = box.getComponent(Transform).position
    box.getComponent(LerpData).target = temp

    let transform = box.getComponent(Transform)
    let lerp = box.getComponent(LerpData)
    lerp.fraction += dt / 6
    
    if (lerp.fraction < 1) {
      transform.position = Vector3.Lerp(lerp.origin, lerp.target, lerp.fraction)
    }
  }
}

box.addComponent(new LerpData())
let lerps = new LerpMove()