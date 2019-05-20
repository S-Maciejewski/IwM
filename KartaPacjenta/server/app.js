const express = require('express');
const cors = require('cors')
const rp = require('request-promise');
const app = express();
const port = 8000;
app.use(cors());


class Patient {
    constructor(id, versionId, lastUpdated, gender, birthDate, active) {
        this.id = id;
        this.versionId = versionId;
        this.lastUpdated = lastUpdated;
        this.gender = gender;
        this.birthDate = birthDate;
        this.active = active;
    }
}

function getPatientData(id) {
    return rp('http://hapi.fhir.org/baseDstu3/Patient/' + id + '/_history/1?_format=json')
}

async function getPatient(id){
    await getPatientData(id).then(res => {
        res = JSON.parse(res)
        // console.log(res);
        patient = new Patient(id, res.meta.versionId, res.meta.lastUpdated, res.gender, res.birthDate, res.active)
    })
    console.log(patient)
    return patient
}


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/getPatient', (req, res) => res.send(getPatient(1656954)));

app.listen(port, () => console.log(`Notes server listening on port ${port}!`));
