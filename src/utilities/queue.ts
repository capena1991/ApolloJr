type Task<T> = () => Promise<T>

export class TaskQueueHandler<T> {
  queue: Task<T>[] = []
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
      } catch (error) {
        console.error(error)
        continue
      }
    }
    this.handling = false
  }

  enqueue = (task: Task<T>) => {
    this.queue.push(task)
    this.handle()
  }
}
