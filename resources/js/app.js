function onWindowClose() {
    Neutralino.app.exit();
}

Neutralino.init();
Neutralino.events.on("windowClose", onWindowClose);


window.saveFile = async (name, data) => {

    if (!name || !data) return;

    let dirExists = false;
    try {
        const directoryExists = await Neutralino.filesystem.getStats(NL_PATH + '/results');
        if (directoryExists.isDirectory) dirExists = true;
    }
    finally {
        if (!dirExists) {
            await Neutralino.filesystem.createDirectory(NL_PATH + '/results');
        }
    }

    const fileData = typeof data === 'string' ? data : JSON.stringify(data, null, 4);
    await Neutralino.filesystem.writeFile(NL_PATH + `/results/${name}`, fileData);
}

window.saveBinaryFile = async (name, data) => {

    if (!name || !data) return;

    let dirExists = false;
    try {
        const directoryExists = await Neutralino.filesystem.getStats(NL_PATH + '/results');
        if (directoryExists.isDirectory) dirExists = true;
    }
    finally {
        if (!dirExists) {
            await Neutralino.filesystem.createDirectory(NL_PATH + '/results');
        }
    }

    await Neutralino.filesystem.writeBinaryFile(NL_PATH + `/results/${name}`, data);
}

