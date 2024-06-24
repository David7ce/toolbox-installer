const fs = require('fs');

const jsonFilePath = 'packages-info.json';

// Función para ordenar los paquetes alfabéticamente
function ordenarPaquetesAlfabeticamente(filePath) {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error al leer el archivo:', err);
            return;
        }

        try {
            const packagesJSON = JSON.parse(data);

            // Ordenar las claves (nombres de paquetes) alfabéticamente
            const sortedPackages = {};
            Object.keys(packagesJSON.packages)
                .sort()
                .forEach(key => {
                    sortedPackages[key] = packagesJSON.packages[key];
                });

            // Crear un nuevo objeto JSON con los paquetes ordenados
            const sortedJSON = {
                packages: sortedPackages
            };

            // Convertir a JSON y mostrar por consola
            const sortedJSONString = JSON.stringify(sortedJSON, null, 2);
            console.log(sortedJSONString);

            // Opcional: Escribir el JSON ordenado de vuelta al archivo
            fs.writeFile(filePath, sortedJSONString, 'utf8', (err) => {
                if (err) {
                    console.error('Error al escribir el archivo ordenado:', err);
                } else {
                    console.log('Archivo ordenado guardado correctamente.');
                }
            });

        } catch (error) {
            console.error('Error al parsear el archivo JSON:', error);
        }
    });
}

// Llama a la función para ordenar paquetes alfabéticamente
ordenarPaquetesAlfabeticamente(jsonFilePath);
