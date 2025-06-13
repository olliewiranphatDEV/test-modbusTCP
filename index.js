const ModbusRTU = require("modbus-serial");
const express = require("express");
const app = express();
const port = 3001;
const path = require("path");

// Serve HTML, CSS, JS จาก public/
app.use(express.static(path.join(__dirname, 'public')));


// อ่านค่าที่เป็น float (REAL4) - Flow Rate
async function readFloatFromRegisters(startAddress) {
    const client = new ModbusRTU(); // สร้างใหม่ทุกครั้ง
    try {
        // Connect to TCP device
        await client.connectTCP("49.0.79.169", { port: 502 });
        client.setTimeout(1000); // เพิ่ม timeout เป็น 500 m
        client.setID(1);

        // - Read 2 registers (4 bytes)
        const data = await client.readHoldingRegisters(startAddress, 2);
        console.log("Reading from startAddress:", startAddress);
        console.log("Raw Register Data:", data.data);

        // Convert 2 x 16-bit into 1 x 32-bit float
        const buf = Buffer.alloc(4);
        buf.writeUInt16BE(data.data[1], 0);
        buf.writeUInt16BE(data.data[0], 2);
        await client.close(); // disconnect ทันที

        if (!data || !data.data || data.data.length < 2) {
            await client.close(); // CLOSE CONNECTION ALTHOUGH ERROR
            throw new Error("Invalid Modbus response");
        }

        return buf.readFloatBE(0); //Flow Rate - float (REAL4)
    } catch (error) {
        console.error("readFloatFromRegisters ERROR:", error.message);
        try { await client.close(); } catch (_) { } // client.close() ถูกเรียกเสมอ แม้ในกรณี catch
        return null;
    }
}


// อ่านค่าที่เป็น signed integer 32-bit (LONG) - Net Accumulator
async function readLongFromRegisters(startAddress) {
    const client = new ModbusRTU(); // สร้างใหม่ทุกครั้ง
    try {
        // Connect to TCP device
        await client.connectTCP("49.0.79.169", { port: 502 });
        client.setTimeout(1000); // เพิ่ม timeout เป็น 500 m
        client.setID(1);

        const data = await client.readHoldingRegisters(startAddress, 2);
        console.log("Reading from startAddress:", startAddress);
        console.log("Raw Register Data:", data.data);

        const buf = Buffer.alloc(4);
        buf.writeUInt16BE(data.data[1], 0); //0001
        buf.writeUInt16BE(data.data[0], 2); //0002
        await client.close(); // disconnect ทันที

        if (!data || !data.data || data.data.length < 2) {
            await client.close(); // CLOSE CONNECTION ALTHOUGH ERROR
            throw new Error("Invalid Modbus response");
        }


        return buf.readInt32BE(0); // ใช้กับ LONG
    } catch (error) {
        console.error("readLongFromRegisters ERROR:", error.message);
        try { await client.close(); } catch (_) { } // client.close() ถูกเรียกเสมอ แม้ในกรณี catch
        return null;
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
