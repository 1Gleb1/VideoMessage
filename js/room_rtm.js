let handleMemberJoined = async (MemberId) => {
  console.log("a new member has joined the room: ", MemberId);
  addMemberToDOM(MemberId);

  let members = await channel.getMembers();
  updateMemberTotal(members);
};

let addMemberToDOM = async (MemberId) => {
  let { name } = await rtmClient.getUserAttributesByKeys(MemberId, ["name"]);

  let membersWrapper = document.getElementById("member__list");
  let memberItem = `<div class="member__wrapper" id="member__${MemberId}__wrapper">
                    <span class="green__icon"></span>
                    <p class="member_name">${name}</p>
                </div>`;
  membersWrapper.insertAdjacentHTML("beforeend", memberItem);
};

let updateMemberTotal = async (members) => {
  let total = document.getElementById("members__count");
  total.innerText = members.length;
};

let handleMemberLeft = async (MemberId) => {
  removeMemberFromDOM(MemberId);

  let members = await channel.getMembers();
  updateMemberTotal(members);
};

let removeMemberFromDOM = async (MemberId) => {
  let membersWrapper = document.getElementById(`member__${MemberId}__wrapper`);
  membersWrapper.remove();
};

let getMembers = async () => {
  let members = await channel.getMembers();
  updateMemberTotal(members);
  for (let i = 0; i < members.length; i++) {
    addMemberToDOM(members[i]);
  }
};

// Messages

let handleChannelMessage = async (messageData, MemberId) => {
  let data = JSON.parse(messageData.text);

  if (data.type == "chat") {
    addMessageToDOM(data.displayName, data.message);
  }
};

let sendMessage = async (e) => {
  e.preventDefault();

  let message = e.target.message.value;
  channel.sendMessage({
    text: JSON.stringify({
      type: "chat",
      message: message,
      displayName: displayName,
    }),
  });

  addMessageToDOM(displayName, message);
  e.target.reset();
};

let addMessageToDOM = async (name, message) => {
  let messageWrapper = document.getElementById("messages");
  let newMessage = `<div class="message__wrapper">      
                      <div class="message__body">
                          <strong class="message__author">${name}</strong>  
                          <p class="message__text">${message}</p>
                      </div>
                    </div>`;
  messageWrapper.insertAdjacentHTML("beforeend", newMessage);
  let lastMessage = document.querySelector(
    "#messages .message__wrapper:last-child"
  );
  if (lastMessage) lastMessage.scrollIntoView();
};

let messageForm = document.getElementById("message__form");
messageForm.addEventListener("submit", sendMessage);

let leaveChannel = async () => {
  await channel.leave();
  await rtmClient.logout();
};

window.addEventListener("beforeunload", leaveChannel);
