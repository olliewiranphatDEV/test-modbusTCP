
async function getFlowRate() {
    console.log("Flow");

    try {
        const res = await fetch('/flow-rate');
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Unknown error");
        }

        document.getElementById('flowRate').textContent =
            data.flowRate_m3h?.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }) ?? 'null';

        document.getElementById('flowLastUpdated').textContent = new Date().toLocaleTimeString();

    } catch (err) {
        document.getElementById('flowRate').textContent = `Error: ${err.message}`;
    }
}

async function getNetAccumulator() {
    console.log("Net");

    try {
        const res = await fetch('/net-accumulator');
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Unknown error");
        }

        document.getElementById('netAcc').textContent = data.netAccumulator?.toLocaleString('en-US') ?? 'null';
        document.getElementById('netLastUpdated').textContent = new Date().toLocaleTimeString();

    } catch (err) {
        document.getElementById('netAcc').textContent = `Error: ${err.message}`;
    }
}


window.onload = function () {
    getFlowRate();
    getNetAccumulator();

    setInterval(() => {
        getFlowRate();
        getNetAccumulator();
    }, 5000);
};