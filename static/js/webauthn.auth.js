'use strict';

let getMakeCredentialsChallenge = (formBody) => {
    return fetch('/webauthn/register', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formBody)
    })
    .then((response) => response.json())
    .then((response) => {
        if(response.status !== 'ok')
            throw new Error(`Server responed with error. The message is: ${response.message}`);
        console.log(response, ' this si response')
        return response
    })
}
let getGetAssertionChallenge = (formBody) => {
    return fetch('/webauthn/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formBody)
    })
    .then((response) => response.json())
    .then((response) => {
        if(response.status !== 'ok')
            throw new Error(`Server responed with error. The message is: ${response.message}`);

        return response
    })
}

let sendWebAuthnResponse = (body) => {
    return fetch('/webauthn/response', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })
    .then((response) => response.json())
    .then((response) => {
        if(response.status !== 'ok')
            throw new Error(`Server responed with error. The message is: ${response.message}`);

        return response
    })
}
/* Handle for register form submission */
$('#register').submit(function(event) {
    event.preventDefault();
    console.log('running!')
    if(!navigator.credentials){
        return alert("Creds Not Support")
    }
    navigator.credentials.get().then(resp => console.log('all creds ', resp)).catch(er => console.log(er , ' no cred!'))
    let username = this.username.value;
    let name     = this.name.value;

    if(!username || !name) {
        alert('Name or username is missing!')
        return
    }
    console.log(navigator.credentials, ' checking hardware ')
    getMakeCredentialsChallenge({username, name})
    .then((response) => {
        let publicKey = preformatMakeCredReq(response);
        console.log(publicKey, ' poiblic key!')

        return navigator.credentials.create({ publicKey })
    })
    
    .then((response) => {
        console.log(response, ' resp of public key ')

        let makeCredResponse = publicKeyCredentialToJSON(response);
        console.log(makeCredResponse, ' make cred resp ')
        return sendWebAuthnResponse(makeCredResponse)
    })
    .then((response) => {
        if(response.status === 'ok') {
            loadMainContainer()   
        } else {
            alert(`Server responed with error. The message is: ${response.message}`);
        }
    })
    .catch((error) => alert(error))

})

        
/* Handle for login form submission */
$('#login').submit(function(event) {
    event.preventDefault();
    
    let username = this.username.value;
    if(!username) {
        alert('Username is missing1!')
        return
    }

    getGetAssertionChallenge({username})
        .then((response) => {
            let publicKey = preformatGetAssertReq(response);
        console.log(publicKey, ' poiblic key!')
            return navigator.credentials.get({ publicKey })
        })
        .then((response) => {
            console.log(response, ' public key to json')
            let getAssertionResponse = publicKeyCredentialToJSON(response);
            console.log(getAssertionResponse,'getAssertionResp')
            return sendWebAuthnResponse(getAssertionResponse)
        })
        .then((response) => {
            if(response.status === 'ok') {
                loadMainContainer()   
            } else {
                alert(`Server responed with error. The message is: ${response.message}`);
            }
        })
        .catch((error) => alert(error))
})