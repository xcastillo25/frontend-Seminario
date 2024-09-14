// MotorValidaciones.js
const MotorValidaciones = {
    // Validación para permitir solo números con una longitud máxima
    validaSoloNumeros: (event, longitudMax) => {
        const codigoCaracter = event.which ? event.which : event.keyCode;
        const caracter = String.fromCharCode(codigoCaracter);

        // Permite solo números
        if (!/^[0-9]$/.test(caracter)) {
            event.preventDefault();
            return;
        }

        // Limita la longitud del valor
        if (longitudMax !== 0) {
            if (event.target.value.length >= longitudMax) {
                event.preventDefault();
            }
        }
    },

    validarDPI: (event) => {
        const input = event.target;
        let cui = input.value;
        let cumple = 1;
        let valido = 1;

        if (!cui) {
            valido = 0;
        }

        const cuiRegExp = /^[0-9]{4}\s?[0-9]{5}\s?[0-9]{4}$/;

        if (!cuiRegExp.test(cui)) {
            valido = 0;
        }

        if ((cui.length < 13 || cui.length > 13) && cui.length !== 0) {
            valido = 0;
        }

        if (isNaN(cui)) {
            valido = 0;
        }

        cui = cui.replace(/\s/g, "");
        const depto = parseInt(cui.substring(9, 11), 10);
        const muni = parseInt(cui.substring(11, 13));
        const numero = cui.substring(0, 8);
        const verificador = parseInt(cui.substring(8, 9));

        const munisPorDepto = [
            17, 8, 16, 16, 13, 14, 19, 8, 24, 21, 9, 30, 32, 21, 8, 17, 14, 5, 11, 11,
            7, 17,
        ];

        if (depto === 0 || muni === 0) {
            valido = 0;
        }

        if (depto > munisPorDepto.length) {
            valido = 0;
        }

        if (muni > munisPorDepto[depto - 1]) {
            valido = 0;
        }

        let total = 0;
        for (let i = 0; i < numero.length; i++) {
            total += numero[i] * (i + 2);
        }

        const modulo = total % 11;

        if (modulo !== verificador) {
            cumple = 0;
        }

        if (cumple === 0 || valido === 0) {
            input.style.background = "#F6B2B2";
        } else {
            input.style.background = "#ffffff";
        }
    },

    // Validación para caracteres permitidos en un email
    validaCaracteresEmail: (event) => {
        const codigoCaracter = event.which ? event.which : event.keyCode;
        const caracter = String.fromCharCode(codigoCaracter);

        // Referencia al campo que está recibiendo el evento
        const input = event.target;

        // Si el carácter es '@', verifica si ya existe uno en el campo
        if (caracter === "@" && input.value.includes("@")) {
            event.preventDefault();
            return;
        }

        // Regex para caracteres válidos en email
        if (!/^[a-zA-Z0-9._+@]$/.test(caracter)) {
            event.preventDefault();
        }
    },

    // Validación para un email completo en onBlur
    validarEmailCompleto: (event) => {
        const input = event.target; // Aquí obtenemos el input desde el evento
        const valor = input.value;
        const regex =
            /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;

        if (!regex.test(valor)) {
            input.style.background = "#F6B2B2";
            return false;
        } else {
            input.style.background = "#ffffff";
            return true;
        }
    },

    validarNIT: (event) => {
        const input = event.target;
        const valor = input.value;
        let resultado = true; // Se asume que es válido hasta que se demuestre lo contrario

        // Comprobación básica de formato (ej. 1234567-8 o 1234567-K)
        const formatoNIT = /^(\d+)-?([\dk])$/i;
        const match = formatoNIT.exec(valor);

        if (!match) {
            // Si no coincide con el formato básico, no es válido
            resultado = false;
        } else {
            const numero = match[1];
            const digitoVerificador =
                match[2].toLowerCase() === "k" ? 10 : parseInt(match[2], 10);
            let suma = 0;

            // Cálculo del dígito verificador
            for (let i = 0; i < numero.length; i++) {
                suma += parseInt(numero[i], 10) * (numero.length + 1 - i);
            }

            const modulo = (11 - (suma % 11)) % 11;

            if (modulo !== digitoVerificador) {
                resultado = false;
            }
        }

        if (!resultado) {
            input.style.background = "#F6B2B2";
        } else {
            input.style.background = "#ffffff";
        }
    },

    validaSoloNumerosCompleto: (event) => {
        const input = event.target;
        const valor = input.value;
        let resultado = true;

        const formatoNumeros = /^[0-9]+$/;
        const match = formatoNumeros.exec(valor);

        if(!match) {
            resultado = false;
        }
        if (!resultado) {
            input.style.background = "#F6B2B2";
        } else {
            input.style.background = "#ffffff";
        }
    },


    validaSoloLetrasCompleto: (event) => {
        const input = event.target;
        const valor = input.value;
        let resultado = true;

        const formatoLetras = /^[a-zA-ZñÑ\s]+$/;
        const match = formatoLetras.exec(valor);

        if(!match) {
            resultado = false;
        }

        if (!resultado) {
            input.style.background = "#F6B2B2";
        } else {
            input.style.background = "#ffffff";
        }
    },


    validaLetrasYNumerosCompleto: (event) => {
        const input = event.target;
        const valor = input.value;
        let resultado = true;

        const formato = /^[a-zA-Z0-9ñÑ]+$/;
        const match = formato.exec(valor);

        if(!match) {
            resultado = false;
        }

        if (!resultado) {
            input.style.background = "#F6B2B2";
        } else {
            input.style.background = "#ffffff";
        }
    },


    validarNITKeyPress: (event) => {
        const codigoCaracter = event.which ? event.which : event.keyCode;
        const caracter = String.fromCharCode(codigoCaracter);
    
        // Permitir solo números, guion y la letra K o k
        const caracteresValidos = /^[0-9kK-]$/;
    
        if (!caracteresValidos.test(caracter)) {
          event.preventDefault(); // Prevenir la entrada de caracteres no válidos
        }
      },


      validarNumerosYLetrasKeyPress: (event) => {
        const codigoCaracter = event.which ? event.which : event.keyCode;
        const caracter = String.fromCharCode(codigoCaracter);
    
        const caracteresValidos = /^[a-zA-Z0-9ñÑ]+$/;
    
        if (!caracteresValidos.test(caracter)) {    
          event.preventDefault(); 
        }
      },

      



    // Validación para permitir solo letras y espacios
    validaSoloLetras: (event) => {
        const codigoCaracter = event.which ? event.which : event.keyCode;
        const caracter = String.fromCharCode(codigoCaracter);

        // Permite solo letras (mayúsculas y minúsculas) y espacios
        if (!/^[a-zA-ZñÑ\s]+$/.test(caracter)) {
            event.preventDefault();
        }
    },

    // Método para agregar un evento a un elemento
    agregarEvento: (elemento, evento, funcion, ...params) => {
        if (elemento) {
            elemento.addEventListener(evento, (e) => funcion(e, ...params));
        }
    },

    // Método para remover un evento de un elemento
    removerEvento: (elemento, evento, funcion) => {
        if (elemento) {
            elemento.removeEventListener(evento, funcion);
        }
    },
};

export default MotorValidaciones;
