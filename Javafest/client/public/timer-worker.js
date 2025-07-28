let timerId = null
let currentTime = 0


self.onmessage = (e) => {
    const { type, data } = e.data

    switch (type) {
        case "START_TIMER":
            startTimer(data.duration || 10)
            break
        case "STOP_TIMER":
            stopTimer()
            break
        case "RESET_TIMER":
            resetTimer()
            break
    }
}

function startTimer(duration) {
    stopTimer() // Clear any existing timer
    currentTime = duration

    // Send initial time
    self.postMessage({ type: "TIMER_TICK", time: currentTime })

    // Start countdown
    const countdown = () => {
        currentTime--
        self.postMessage({ type: "TIMER_TICK", time: currentTime })

        if (currentTime > 0) {
            timerId = setTimeout(countdown, 1000)
        } else {
            self.postMessage({ type: "TIMER_FINISHED" })
            timerId = null
        }
    }

    // Start after 1 second
    timerId = setTimeout(countdown, 1000)
}

function stopTimer() {
    if (timerId) {
        clearTimeout(timerId)
        timerId = null
    }
}

function resetTimer() {
    stopTimer()
    currentTime = 0
    self.postMessage({ type: "TIMER_TICK", time: currentTime })
}
