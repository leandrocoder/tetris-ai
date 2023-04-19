const isNeutralinoApp = window.hasOwnProperty('NL_VERSION');

if (isNeutralinoApp) {
    Neutralino.init();
    Neutralino.events.on("windowClose", () => Neutralino.app.exit());
}

window.createDirectory = async (path) => {
    if (!isNeutralinoApp || !path) return;
    try {
        await Neutralino.filesystem.createDirectory(path);
    } catch {}
}

window.saveFile = async (name, data) => {
    if (!isNeutralinoApp || !name || !data) return;
    await window.createDirectory(NL_PATH + '/logs');
    const fileData = typeof data === 'string' ? data : JSON.stringify(data, null, 4);
    await Neutralino.filesystem.writeFile(NL_PATH + `/logs/${name}`, fileData);
}

window.saveBinaryFile = async (name, data) => {
    if (!isNeutralinoApp || !name || !data) return;
    await window.createDirectory(NL_PATH + '/logs');
    await Neutralino.filesystem.writeBinaryFile(NL_PATH + `/logs/${name}`, data);
}
