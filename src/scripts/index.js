/*
  Файл index.js является точкой входа в приложение
  и только он содержит логику инициализации, используя импорты из модулей.

  Из index.js ничего не экспортируется.
*/

import { createCardElement } from "./components/card.js";
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
const headerLogo = document.querySelector(".header__logo");

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
          { term: "Название:", description: cardData.name },
          { term: "Автор:", description: cardData.owner?.name ?? "—" },
          { term: "Лайков:", description: String(cardData.likes.length) },
          {
            term: "Дата создания:",
            description: formatDate(new Date(cardData.createdAt)),
          },
        ],
        listTitle:
          cardData.likes.length > 0 ? "Лайкнули:" : "Лайков пока нет",
        listItems: cardData.likes.map((user) => user.name),
      });

      openModalWindow(infoModalWindow);
    })
    .catch((err) => {
      console.log(err);
    });
};

const handleLogoClick = () => {
  getCardList()
    .then((cards) => {
      if (cards.length === 0) {
        renderInfoModalContent({
          title: "Статистика",
          infoItems: [{ term: "Всего карточек:", description: "0" }],
          listTitle: "",
          listItems: [],
        });

        openModalWindow(infoModalWindow);
        return;
      }

      const sortedCards = [...cards].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      const firstCreatedCard = sortedCards[sortedCards.length - 1];
      const lastCreatedCard = sortedCards[0];

      const totalLikes = cards.reduce((acc, card) => acc + card.likes.length, 0);
      const mostLikedCard = cards.reduce((best, card) => {
        return card.likes.length > best.likes.length ? card : best;
      }, cards[0]);

      const ownersMap = new Map();
      cards.forEach((card) => {
        const ownerId = card.owner?._id;
        if (!ownerId) return;

        const current = ownersMap.get(ownerId);
        ownersMap.set(ownerId, {
          name: card.owner?.name ?? "—",
          count: (current?.count ?? 0) + 1,
        });
      });

      const topOwners = [...ownersMap.values()]
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map((owner) => `${owner.name} — ${owner.count}`);

      renderInfoModalContent({
        title: "Статистика",
        infoItems: [
          { term: "Всего карточек:", description: String(cards.length) },
          { term: "Всего лайков:", description: String(totalLikes) },
          {
            term: "Первая создана:",
            description: firstCreatedCard
              ? formatDate(new Date(firstCreatedCard.createdAt))
              : "—",
          },
          {
            term: "Последняя создана:",
            description: lastCreatedCard
              ? formatDate(new Date(lastCreatedCard.createdAt))
              : "—",
          },
          {
            term: "Самая залайканная:",
            description: mostLikedCard
              ? `${mostLikedCard.name} (${mostLikedCard.likes.length})`
              : "—",
          },
        ],
        listTitle: topOwners.length > 0 ? "Топ авторы:" : "",
        listItems: topOwners,
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
      const likedByMe = updatedCardData.likes.some(
        (user) => user._id === currentUserId
      );

      likeButton.classList.toggle("card__like-button_is-active", likedByMe);
      if (likeCountElement) {
        likeCountElement.textContent = updatedCardData.likes.length;
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

const handleCardDeleteClick = ({ cardId, cardElement }) => {
  deleteCard(cardId)
    .then(() => {
      cardElement.remove();
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

headerLogo.addEventListener("click", handleLogoClick);

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

