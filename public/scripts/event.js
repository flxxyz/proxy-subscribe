var copy = function (value) {
    if (!value) return
    let input = document.createElement('input')
    document.body.appendChild(input)
    input.setAttribute('value', value)
    input.select()
    if (document.execCommand('copy')) {
        document.execCommand('copy')
        console.log('复制成功', value)
    }
    document.body.removeChild(input)
}

document.addEventListener('DOMContentLoaded', function () {
    var $dropdowns = getAll('.dropdown:not(.is-hoverable)')

    if ($dropdowns.length > 0) {
        $dropdowns.forEach(function ($el) {
            $el.addEventListener('click', function (event) {
                event.stopPropagation()
                $el.classList.toggle('is-active')
            })
        })

        document.addEventListener('click', function (event) {
            closeDropdowns()
        })
    }

    function closeDropdowns() {
        $dropdowns.forEach(function ($el) {
            $el.classList.remove('is-active')
        })
    }

    var $accounts = getAll('.account .remarks a')
    if ($accounts.length > 0) {
        $accounts.forEach(($el) => {
            $el.addEventListener('click', function (event) {
                var root = this.parentElement.parentElement
                var data = JSON.parse(root.querySelector('.source').dataset.data)

                var generate = new Generate()
                generate[data.serviceType](data)

                getElement('.modal-card-title').innerHTML = data.remarks

                $modalCardContents.forEach(function ($el) {
                    $el.classList.remove('is-hidden')
                    if (!$el.classList.contains(data.serviceType)) {
                        $el.classList.add('is-hidden')
                    }
                })
                $modal.classList.toggle('is-active')
            })
        })
    }

    var $subscribes = getAll('.subscribe .link-id a')
    if ($subscribes.length > 0) {
        $subscribes.forEach(($el) => {
            $el.addEventListener('click', function (event) {
                var root = this.parentElement.parentElement
                var data = JSON.parse(root.querySelector('.source').dataset.data)
                copy(`${window.location.origin}/link/${data.linkId}`)
            })
        })
    }

    var $subscribesSourceURL = getAll('.subscribe .urls .url')
    if ($subscribesSourceURL.length > 0) {
        $subscribesSourceURL.forEach($el => {
            $el.addEventListener('click', function (event) {
                copy(this.innerHTML)
            })
        })
    }

    var $chooses = getAll('.choose .checkbox input')
    var $chooseItems = getAll('.choose-item')
    if ($chooses.length > 0) {
        $chooses.forEach(($el) => {
            $el.addEventListener('click', function (event) {
                $chooseItems.forEach($item => {
                    if ($item.dataset.type === $el.classList[0]) {
                        var checkbox = $item.querySelector('.source')
                        checkbox.checked = !checkbox.checked
                    }
                })

            })
        })
    }

    var $generate = getAll('.generate')
    if ($generate.length > 0) {
        $generate.forEach($el => {
            $el.addEventListener('click', function (event) {
                var ids = []

                $chooseItems.forEach($item => {
                    var checkbox = $item.querySelector('.source')
                    if (checkbox.checked) {
                        var data = JSON.parse(checkbox.dataset.data)
                        ids.push(data.objectId)
                    }
                })

                if (ids.length > 0) {
                    Request({
                        method: 'post',
                        url: '/api/generate',
                        dataType: 'json',
                        data: {
                            ids: ids.join(','),
                        },
                        success: function (res) {
                            console.log('res:', res)
                        }
                    })
                }
            })
        })
    }

    var $deleteServer = getAll('.delete-server')
    if ($deleteServer.length > 0) {
        $deleteServer.forEach(function ($el) {
            $el.addEventListener('click', function (event) {
                console.log(window.a = this.classList)
                var ids = []

                $chooseItems.forEach($item => {
                    var checkbox = $item.querySelector('.source')
                    if (checkbox.checked) {
                        var data = JSON.parse(checkbox.dataset.data)
                        ids.push(data.objectId)
                    }
                })

                if (ids.length > 0) {
                    Request({
                        method: 'post',
                        url: '/api/delete',
                        dataType: 'json',
                        data: {
                            ids: ids.join(','),
                            className: this.classList.item(2),
                        },
                        success: function (res) {
                            console.log('res:', res)
                        }
                    })
                }
            })
        })
    }

    var $importSubscribe = getAll('.import-subscribe')
    if ($importSubscribe.length > 0) {

    }

    var $modal = getElement('.modal')
    var $modalButtons = getAll('.modal-button')
    var $modalCloses = getAll('.modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button')
    var $modalCardContents = getAll('.modal-card-body .content')

    if ($modalButtons.length > 0) {
        $modalButtons.forEach(function ($el) {
            $el.addEventListener('click', function (event) {
                var target = $el.dataset.target
                openModal(target)
            })
        })
    }

    if ($modalCloses.length > 0) {
        $modalCloses.forEach(function ($el) {
            $el.addEventListener('click', closeModal)
        })
    }

    function openModal(target) {
        var $target = document.getElementById(target);
        document.documentElement.classList.add('is-clipped')
        $target.classList.add('is-active')
    }

    function closeModal() {
        document.documentElement.classList.remove('is-clipped')
        $modal.classList.remove('is-active')
    }
})