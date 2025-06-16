const ModbusRTU = require("modbus-serial");
const express = require("express");
const app = express();
const port = 3001;
const path = require("path");

// Serve HTML, CSS, JS จาก public/
app.use(express.static(path.join(__dirname, 'public')));


// อ่านค่าที่เป็น float (REAL4) - Flow Rate
async function readFloatFromRegisters(startAddress) {
    const client = new ModbusRTU(); // สร้าง connection ใหม่ทุกครั้ง
    try {
        // Connect to TCP device
        await client.connectTCP("49.0.79.169", { port: 502 });
        console.log("Connected.");

        client.setTimeout(3000); // FOR FETCHING DATA
        client.setID(1);

        // - Read 2 registers (4 bytes)
        const data = await client.readHoldingRegisters(startAddress, 2);

        if (!data || !data.data || data.data.length < 2) {
            throw new Error("Invalid Modbus response");
        }

        console.log("Reading from startAddress:", startAddress);
        console.log("Raw Register Data:", data.data);

        // Convert 2 x 16-bit into 1 x 32-bit float
        const buf = Buffer.alloc(4);
        buf.writeUInt16BE(data.data[1], 0);
        buf.writeUInt16BE(data.data[0], 2);

        return buf.readFloatBE(0); //Flow Rate - float (REAL4)
    } catch (error) {
        console.error("readFloatFromRegisters ERROR:", error.message);
        return null;
    } finally {
        console.log("TRYING TO DISCONNECT...");
        try {
            await Promise.race([
                client.close(),
                new Promise(resolve => setTimeout(resolve, 1000))
            ]);
            console.log("DISCONNECTED!");
        } catch (closeErr) {
            console.error("Error while disconnecting:", closeErr.message);
        }
    }


}


// อ่านค่าที่เป็น signed integer 32-bit (LONG) - Net Accumulator
async function readLongFromRegisters(startAddress) {
    const client = new ModbusRTU(); // สร้าง connection ใหม่ทุกครั้ง
    try {
        // Connect to TCP device
        await client.connectTCP("49.0.79.169", { port: 502 });
        console.log("Connected.");

        client.setTimeout(3000); // // FOR FETCHING DATA
        client.setID(1);

        const data = await client.readHoldingRegisters(startAddress, 2);

        if (!data || !data.data || data.data.length < 2) {
            throw new Error("Invalid Modbus response");
        }

        console.log("Reading from startAddress:", startAddress);
        console.log("Raw Register Data:", data.data);

        const buf = Buffer.alloc(4);
        buf.writeUInt16BE(data.data[1], 0); //0001
        buf.writeUInt16BE(data.data[0], 2); //0002

        return buf.readInt32BE(0); // ใช้กับ LONG
    } catch (error) {
        console.error("readLongFromRegisters ERROR:", error.message);
        return null;
    } finally {
        console.log("TRYING TO DISCONNECT...");
        try {
            await Promise.race([
                client.close(),
                new Promise(resolve => setTimeout(resolve, 1000))
            ]);
            console.log("DISCONNECTED!");
        } catch (closeErr) {
            console.error("Error while disconnecting:", closeErr.message);
        }
    }


}

// default route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});


// Route to get Flow Rate from register 0001-0002
app.get("/flow-rate", async (req, res) => {
    try {
        const result = await readFloatFromRegisters(0); // startAddress = 0
        if (result === null) throw new Error("No data");
        res.json({ flowRate_m3h: parseFloat(result.toFixed(2)) });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
});

// Route to get Net Accumulator from register 0025-0026
app.get("/net-accumulator", async (req, res) => {
    try {
        const result = await readLongFromRegisters(24); // 0025 = index 24
        if (result === null) throw new Error("No data");
        res.json({ netAccumulator: result });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
});

app.listen(port, () => {
    console.log(`Modbus app running at http://localhost:${port}`);
});
