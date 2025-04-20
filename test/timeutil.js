const timeUtil = require("../src/utils/time.js");

function test() {
    const d = timeUtil.strToDate('01/01/2023 18:00:00')
    console.log(d) // 2023-01-01T00:00:00.000Z
}

test()