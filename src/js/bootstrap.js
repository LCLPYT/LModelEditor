const Bootstrap = {
    openModal: id => $(`#${id}`).modal('show'),
    closeModal: id => $(`#${id}`).modal('hide')
};

export { Bootstrap };