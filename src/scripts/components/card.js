const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

export const updateCardLikeState = (
  { likeButton, likeCountElement },
  likes,
  currentUserId
) => {
  const likedByMe = likes.some((user) => user._id === currentUserId);
  likeButton.classList.toggle("card__like-button_is-active", likedByMe);

  if (likeCountElement) {
    likeCountElement.textContent = likes.length;
  }
};

export const removeCardElement = (cardElement) => {
  cardElement.remove();
};

export const createCardElement = (
  cardData,
  { currentUserId, onPreviewPicture, onLikeClick, onDeleteClick, onInfoClick }
) => {
  const cardElement = getTemplate();
  const likeButton = cardElement.querySelector(".card__like-button");
  const deleteButton = cardElement.querySelector(
    ".card__control-button_type_delete"
  );
  const infoButton = cardElement.querySelector(
    ".card__control-button_type_info"
  );
  const cardImage = cardElement.querySelector(".card__image");
  const likeCountElement = cardElement.querySelector(".card__like-count");

  cardImage.src = cardData.link;
  cardImage.alt = cardData.name;
  cardElement.querySelector(".card__title").textContent = cardData.name;

  if (likeCountElement) {
    likeCountElement.textContent = cardData.likes.length;
  }

  if (
    currentUserId &&
    cardData.likes.some((user) => user._id === currentUserId)
  ) {
    likeButton.classList.add("card__like-button_is-active");
  }

  if (
    currentUserId &&
    cardData.owner &&
    cardData.owner._id &&
    cardData.owner._id !== currentUserId
  ) {
    deleteButton?.remove();
  }

  if (onLikeClick) {
    likeButton.addEventListener("click", () =>
      onLikeClick({
        cardId: cardData._id,
        isLiked: likeButton.classList.contains("card__like-button_is-active"),
        likeButton,
        likeCountElement,
      })
    );
  }

  if (onDeleteClick) {
    deleteButton?.addEventListener("click", () =>
      onDeleteClick({
        cardId: cardData._id,
        cardElement,
      })
    );
  }

  if (onPreviewPicture) {
    cardImage.addEventListener("click", () =>
      onPreviewPicture({ name: cardData.name, link: cardData.link })
    );
  }

  if (onInfoClick) {
    infoButton?.addEventListener("click", () => onInfoClick(cardData._id));
  }

  return cardElement;
};
