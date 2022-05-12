document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('.btn-primary').addEventListener('click', () => send_email());

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(result => {
      show_mails(result);
  });
}

function send_email() {

  recipients=document.querySelector('#compose-recipients').value
  subject=document.querySelector('#compose-subject').value
  body=document.querySelector('#compose-body').value

  fetch('/emails', {
  method: 'POST',
  body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
  });

  load_mailbox('sent')
}

function show_mails(result) {
  for (let i= 0; i < result.length; i++) {
    let id = result[i].id
    let senders = result[i].sender
    let subject = result[i].subject
    let timestamp = result[i].timestamp
    let read = result[i].read

    let element = document.createElement('div');
    element.innerHTML = `${senders} ${subject} ${timestamp}`;
    element.style.border = "1px solid black"
    element.style.borderRadius = "5px"
    element.style.padding = "5px"
    element.id = id
    if (read) {
      element.style.backgroundColor = "white"
    }
    else {
      element.style.backgroundColor = "lightGray"
    }
    element.addEventListener('click', get_mail)
    document.querySelector('#emails-view').append(element);
  }
}

function get_mail(e) {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';

  id = e.target.id
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(result => show_mail(result))

  fetch(`/emails/${id}`,{
  method: 'PUT',
  body: JSON.stringify({
    read: true
    })
  })
}

function show_mail(result) {
  const id = result.id
  const sender = result.sender
  const recipient = result.recipients
  const subject = result.subject
  const body = result.body
  const timestamp = result.timestamp
  const archived = result.archived

  document.querySelector('#email-view').innerHTML = `<h3>${subject}</h3>`;

  const sender_html = document.createElement('div');
  sender_html.innerHTML = `from: ${sender}`
  document.querySelector('#email-view').append(sender_html);

  const recipient_html = document.createElement('div');
  recipient_html.innerHTML = `to: ${recipient}`
  document.querySelector('#email-view').append(recipient_html);

  const timestamp_html = document.createElement('div');
  timestamp_html.innerHTML = `at: ${timestamp}`
  document.querySelector('#email-view').append(timestamp_html);

  const body_html = document.createElement('p');
  body_html.innerHTML = `${body}`
  document.querySelector('#email-view').append(body_html);

  const archive_button = document.createElement('button')

  if (archived) {
    archive_button.innerHTML = 'unarchive'
  }
  else {
    archive_button.innerHTML = 'archive'
  }

  archive_button.addEventListener('click', () => {
    fetch(`/emails/${id}`,{
      method: 'PUT',
      body: JSON.stringify({
      archived: !archived
      })
    })
    load_mailbox('inbox')
  })

  document.querySelector('#email-view').append(archive_button);
}


