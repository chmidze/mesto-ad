/*
  Файл index.js является точкой входа в приложение
  и только он содержит логику инициализации, используя импорты из модулей.

  Из index.js ничего не экспортируется.
*/

import {
  createCardElement,
  removeCardElement,
  updateCardLikeState,
} from "./components/card.js";
import {
  closeModalWindow,
  openModalWindow,
  setCloseModalWindowEventListeners,
} from "./components/modal.js";
import { clearValidation, enableValidation } from "./components/validation.js";
import {
  addCard,
  changeLikeCardStatus,
  deleteCard,
  getCardList,
  getUserInfo,
  setUserAvatar,
  setUserInfo,
} from "./components/api.js";

// DOM узлы
const placesWrap = document.querySelector(".places__list");

const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(
  ".popup__input_type_description"
);
const profileSubmitButton = profileForm.querySelector(".popup__button");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");
const cardSubmitButton = cardForm.querySelector(".popup__button");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");
const avatarSubmitButton = avatarForm.querySelector(".popup__button");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const infoModalWindow = document.querySelector(".popup_type_info");
const infoModalTitle = infoModalWindow.querySelector(".popup__title");
const infoModalInfoList = infoModalWindow.querySelector(".popup__info");
const infoModalText = infoModalWindow.querySelector(".popup__text");
const infoModalUserList = infoModalWindow.querySelector(".popup__list");

const infoDefinitionTemplate = document
  .querySelector("#popup-info-definition-template")
  .content.querySelector(".popup__info-item");
const infoUserPreviewTemplate = document
  .querySelector("#popup-info-user-preview-template")
  .content.querySelector(".popup__list-item");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const validationConfig = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

let currentUserId = null;

const renderLoading = (buttonElement, isLoading, loadingText) => {
  if (!buttonElement.dataset.defaultText) {
    buttonElement.dataset.defaultText = buttonElement.textContent.trim();
  }

  buttonElement.textContent = isLoading
    ? loadingText
    : buttonElement.dataset.defaultText;
};

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const formatDate = (date) =>
  date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const createInfoString = (term, description) => {
  const infoItem = infoDefinitionTemplate.cloneNode(true);
  infoItem.querySelector(".popup__info-term").textContent = term;
  infoItem.querySelector(".popup__info-description").textContent = description;
  return infoItem;
};

const createUserPreview = (text) => {
  const userBadge = infoUserPreviewTemplate.cloneNode(true);
  userBadge.textContent = text;
  return userBadge;
};

const renderInfoModalContent = ({
  title,
  infoItems,
  listTitle,
  listItems,
}) => {
  infoModalTitle.textContent = title;
  infoModalInfoList.innerHTML = "";
  infoModalUserList.innerHTML = "";

  infoItems.forEach(({ term, description }) => {
    infoModalInfoList.append(createInfoString(term, description));
  });

  infoModalText.textContent = listTitle ?? "";
  listItems.forEach((item) => infoModalUserList.append(createUserPreview(item)));
};

const handleInfoClick = (cardId) => {
  getCardList()
    .then((cards) => {
      const cardData = cards.find((card) => card._id === cardId);
      if (!cardData) {
        return Promise.reject("Ошибка: карточка не найдена");
      }

      renderInfoModalContent({
        title: "Информация о карточке",
        infoItems: [
          { term: "Описание:", description: cardData.name },
          {
            term: "Дата создания:",
            description: formatDate(new Date(cardData.createdAt)),
          },
          { term: "Владелец:", description: cardData.owner?.name ?? "—" },
          {
            term: "Количество лайков:",
            description: String(cardData.likes.length),
          },
        ],
        listTitle: "Лайкнули:",
        listItems:
          cardData.likes.length > 0
            ? cardData.likes.map((user) => user.name)
            : ["Пока никто"],
      });

      openModalWindow(infoModalWindow);
    })
    .catch((err) => {
      console.log(err);
    });
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  renderLoading(profileSubmitButton, true, "Сохранение...");

  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      renderLoading(profileSubmitButton, false);
    });
};

const handleAvatarFormSubmit = (evt) => {
  evt.preventDefault();
  renderLoading(avatarSubmitButton, true, "Сохранение...");

  setUserAvatar({ avatar: avatarInput.value })
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      closeModalWindow(avatarFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      renderLoading(avatarSubmitButton, false);
    });
};

const handleCardLikeClick = ({ cardId, isLiked, likeButton, likeCountElement }) => {
  changeLikeCardStatus(cardId, isLiked)
    .then((updatedCardData) => {
      updateCardLikeState(
        { likeButton, likeCountElement },
        updatedCardData.likes,
        currentUserId
      );
    })
    .catch((err) => {
      console.log(err);
    });
};

const handleCardDeleteClick = ({ cardId, cardElement }) => {
  deleteCard(cardId)
    .then(() => {
      removeCardElement(cardElement);
    })
    .catch((err) => {
      console.log(err);
    });
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  renderLoading(cardSubmitButton, true, "Создание...");

  addCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((cardData) => {
      placesWrap.prepend(
        createCardElement(cardData, {
          currentUserId,
          onPreviewPicture: handlePreviewPicture,
          onLikeClick: handleCardLikeClick,
          onDeleteClick: handleCardDeleteClick,
          onInfoClick: handleInfoClick,
        })
      );

      closeModalWindow(cardFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      renderLoading(cardSubmitButton, false);
    });
};

// EventListeners
profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFormSubmit);

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  clearValidation(profileForm, validationConfig);
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationConfig);
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  clearValidation(cardForm, validationConfig);
  openModalWindow(cardFormModalWindow);
});


// Инициализация данных с сервера
Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
    currentUserId = userData._id;

    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;

    cards.forEach((cardData) => {
      placesWrap.append(
        createCardElement(cardData, {
          currentUserId,
          onPreviewPicture: handlePreviewPicture,
          onLikeClick: handleCardLikeClick,
          onDeleteClick: handleCardDeleteClick,
          onInfoClick: handleInfoClick,
        })
      );
    });
  })
  .catch((err) => {
    console.log(err);
  });

// Настраиваем обработчики закрытия попапов
const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

enableValidation(validationConfig);
