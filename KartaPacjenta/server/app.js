const express = require('express');
const cors = require('cors')
const rp = require('request-promise');
const app = express();
const port = 8000;
app.use(cors());

const patientIDs = [
    1656328,
    1656327,
    1656300,
    1656311,
    1656316
]

class Patient {
    constructor(id, versionId, lastUpdated, gender, birthDate, active, name, surname, address, city) {
        this.id = id;
        this.versionId = versionId;
        this.lastUpdated = lastUpdated;
        this.gender = gender;
        this.birthDate = birthDate;
        this.active = active;
        this.name = name;
        this.surname = surname;
        this.address = address;
        this.city = city;
    }
}

async function getPatientData(id) {
    // return rp('http://hapi.fhir.org/baseDstu3/Patient/' + id + '/_history/' + version);  // Pobieranie wybranej wersji (czy implementujemy?)
    return rp('http://hapi.fhir.org/baseDstu3/Patient/' + id);

}

async function getPatient(id) {
    await getPatientData(id).then(res => {
        res = JSON.parse(res)
        patient = new Patient(id, res.meta.versionId, res.meta.lastUpdated, res.gender ? res.gender : '',
            res.birthDate ? res.birthDate : '', res.active ? res.active : '',
            res.name && res.name[0] ? res.name[0].given[0] : '', res.name && res.name[0] ? res.name[0].family : '',
            res.address && res.address[0] ? res.address[0].text : '', res.address && res.address[0] ? res.address[0].city : '');
    })
    console.log(`Patient ${id} retrieved from server successfully`);
    return patient;
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/getPatient', (req, res) => {
    getPatient(req.query.id).then(patient => {
        res.json(patient);
    });
});

app.get('/getPatientIDs', (req, res) => res.json(patientIDs));

app.listen(port, () => console.log(`Node server listening on port ${port}`));
