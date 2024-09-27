
export function validaDPI(valor) {
    let cui = valor;
    let mensaje = "";
    let valido = true;

    if (!cui || cui === null || cui === undefined) {
        mensaje += "CUI vacío. ";
        valido = false;
    }

    const cuiRegExp = /^[0-9]{4}\s?[0-9]{5}\s?[0-9]{4}$/;

    if (!cuiRegExp.test(cui)) {
        mensaje += "CUI con formato inválido. ";
        valido = false;
    }

    if ((cui.length < 13 || cui.length > 13) && cui.length !== 0) {
        mensaje += "Longitud permitida es de 13. ";
        valido = false;
    }

    if (isNaN(cui)) {
        mensaje += "Solo se permiten números. ";
        valido = false;
    }

    cui = cui.replace(/\s/g, '');
    const depto = parseInt(cui.substring(9, 11), 10);
    const muni = parseInt(cui.substring(11, 13));
    const numero = cui.substring(0, 8);
    const verificador = parseInt(cui.substring(8, 9));

    const munisPorDepto = [
        17, 8, 16, 16, 13, 14, 19, 8, 24, 21, 
        9, 30, 32, 21, 8, 17, 14, 5, 11, 11, 
        7, 17
    ];

    if (depto === 0 || muni === 0) {
        mensaje += "CUI con código de municipio o departamento inválido. ";
        valido = false;
    }

    if (depto > munisPorDepto.length) {
        mensaje += "CUI con código de departamento inválido. ";
        valido = false;
    }

    if (muni > munisPorDepto[depto - 1]) {
        mensaje += "CUI con código de municipio inválido. ";
        valido = false;
    }

    let total = 0;
    for (let i = 0; i < numero.length; i++) {
        total += numero[i] * (i + 2);
    }

    const modulo = total % 11;
    if (modulo !== verificador) {
        mensaje += "CUI con módulo inválido. ";
        valido = false;
    }

    return { valido, mensaje };
}

export function ValidaTelefono(valor){
    let mensaje = "";
    let valido = true;

    if (!valor) {
        mensaje += "Teléfono vacío. ";
        valido = false;
    }

    const telefonoRegex = /^[0-9]+$/;
    if (!telefonoRegex.test(valor)) {
        mensaje += "Teléfono con formato inválido. ";
        valido = false;
    }

    return { valido, mensaje };
}

export function ValidaLetrasAlmacenar(valor, campo){
    let mensaje = "";
    let valido = true;

    if (!valor) {
        mensaje += `Campo ${campo} Vacío`;
        valido = false;
    }

    const campoRegex = /^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s'’]+$/;
    if (!campoRegex.test(valor)) {
        mensaje += `${campo} con formato inválido.`;
        valido = false;
    }

    return { valido, mensaje };
}

export function ValidaLetrasyNumerosAlmacenar(valor, campo){
    let mensaje = "";
    let valido = true;

    if (!valor) {
        mensaje += `Campo ${campo} Vacío`;
        valido = false;
    }

    const campoRegex = /^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚüÜ'’]+$/;
    if (!campoRegex.test(valor)) {
        mensaje += `${campo} con formato inválido.`;
        valido = false;
    }

    return { valido, mensaje };
}


export function validaNIT(valor) {
    let mensaje = "";
    let valido = true;

    if (!valor) {
        mensaje += "NIT vacío. ";
        valido = false;
    }

    const nitRegExp = /^(\d+)-?([\dk])$/i;
    if (!nitRegExp.test(valor)) {
        mensaje += "NIT con formato inválido. ";
        valido = false;
    }

    if (valido) {
        valor = valor.replace("-", "");
        const nitNumeros = valor.slice(0, -1);
        const nitVerificador = valor.slice(-1).toLowerCase() === 'k' ? 10 : parseInt(valor.slice(-1));

        if (isNaN(nitNumeros)) {
            mensaje += "NIT debe contener solo números antes del guion. ";
            valido = false;
        }

        if (valido) {
            let suma = 0;
            for (let i = 0; i < nitNumeros.length; i++) {
                suma += nitNumeros[i] * (nitNumeros.length + 1 - i);
            }

            const modulo = (11 - (suma % 11)) % 11;
            if (modulo !== nitVerificador) {
                mensaje += "NIT con dígito verificador inválido. ";
                valido = false;
            }
        }
    }

    return { valido, mensaje };
}





