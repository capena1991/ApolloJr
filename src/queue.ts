type Task = () => Promise<any>

export class TaskQueueHandler {
  queue: Task[] = []
  handling = false

  handle = async () => {
    if (this.handling) {
      return
    }
    this.handling = true
    while (this.queue.length) {
      const current = this.queue.shift()
      if (!current) {
        continue
      }
      try {
        await current()
      } catch {
        continue
      }
    }
    this.handling = false
  }

  enqueue = (task: Task) => {
    this.queue.push(task)
    this.handle()
  }
}
