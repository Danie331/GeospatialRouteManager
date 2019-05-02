
class PrivateLayersMenuView {
    constructor(eventBroker) {
        this.$container = $('#layersMenu');
        this.eventBroker = eventBroker;
        this.layersCache = null;
        this.userTagsCache = null;

        this.render()
            .attachHandlers()
            .attachEventSubscribers();
    }

    render() {
        this.$container.append(this.content());
        $('.user-tag-selector').select2({
            placeholder: "Select tags...",
            allowClear: true});
        return this;
    }

    attachHandlers() {
        $('.user-tag-selector').on('change.select2', e => {
            var data = $('.user-tag-selector').select2('data')
            if (data && data.length) {
                var userTagModels = [];
                data.forEach(t => {
                    userTagModels.push(new UserTagModel('user-tag', t.text));
                });
                this.eventBroker.broadcast(EventType.TOGGLE_PRIVATE_LAYERS, userTagModels);
            } else {
                this.eventBroker.broadcast(EventType.TOGGLE_PRIVATE_LAYERS);
            }
        });

        $('#privateLayersListContainer').on('click', '.layerLink', e => {
            var layerId = $(e.currentTarget).data('layerid');
            this.eventBroker.broadcast(EventType.SELECT_LAYER, new GeoLayerModel(layerId));
        });

        $("#manageTagsBtn").on('click', e => {
            Swal.fire({
                title: 'My Tags',               
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Save & Close',
                showCancelButton: true,
                cancelButtonText: 'Close',
                html: this.getManageTagsHtml(),
                onBeforeOpen: () => {
                    $('#tagEditorInput').tagEditor({
                        initialTags: [..._.map(this.userTagsCache, e => e.TagValue)],
                        placeholder: 'Enter tags ...',
                        beforeTagSave: function (field, editor, tags, tag, val) {
                            if (tag === '') { // prevent editing existing tags
                                return val.toLowerCase().replace(/\s/g, '');
                            }
                            return false;
                        }
                    });
                }
            }).then((result) => {
                if (result.value) {
                    $.blockUI({ message: "<h2 class='loading-text'>Saving Changes...</h2>" });
                    var tagsToSave = [];
                    var tags = $('#tagEditorInput').tagEditor('getTags')[0].tags;
                    tags.forEach(e => {
                        tagsToSave.push(new UserTagModel('user-tag', e));
                    });
                    this.eventBroker.broadcast(EventType.SAVE_TAGS, tagsToSave);
                }
            });      
        });

        return this;
    }

    attachEventSubscribers() {
        this.eventBroker.subscribe(this.onLayersLoaded.bind(this), EventType.LAYERS_LOADED);
        this.eventBroker.subscribe(this.handleShowLayers.bind(this), EventType.TOGGLE_MENU);
        this.eventBroker.subscribe(this.onTagsLoaded.bind(this), EventType.TAGS_LOADED);
        this.eventBroker.subscribe(this.onTagsSaved.bind(this), EventType.TAGS_SAVED);
        this.eventBroker.subscribe(this.onLayerDeleted.bind(this), EventType.LAYER_DELETED);
        this.eventBroker.subscribe(this.filterLayersByTags.bind(this), EventType.TOGGLE_PRIVATE_LAYERS);

        return this;
    }

    populateTagSelector() {
        var i = 1;
        $('.user-tag-selector').html('');
        this.userTagsCache.forEach(t => {
            var newOption = new Option(t.TagValue, i++, false, false);
            $('.user-tag-selector').append(newOption);
        });
    }

    onTagsSaved(userTagsCollection) {
        this.userTagsCache = userTagsCollection;
        this.populateTagSelector();
        $.unblockUI();
    }

    handleShowLayers(menuNameContainer) {
        if (menuNameContainer.Menu === 'layersMenu') {
            this.eventBroker.broadcast(EventType.TOGGLE_PRIVATE_LAYERS);
            this.eventBroker.broadcast(EventType.LOAD_USER_TAGS, {});
        }
    }

    onLayersLoaded(layerModelList) {
        this.layersCache = layerModelList;
        this.updateLayersSelection(this.layersCache);
    }

    onTagsLoaded(userTagsCollection) {
        this.userTagsCache = userTagsCollection;
        this.populateTagSelector();
    }

    updateLayersSelection(layersCache) {
        var userId = localStorage.getItem('user-id');       
        var container = $("#privateLayersListContainer");
        container.empty();
        layersCache.forEach(layerModel => {
            var userIsOwner = !layerModel.UserId || (userId == layerModel.UserId);
            if (userIsOwner) {
                container.append(this.appendLayerLink(layerModel));
            }
        });
    }

    appendLayerLink(layerModel) {
        return $('<li>').append(
            $('<a>').attr('href', '#')
                .addClass('layerLink')
                .text(layerModel.LayerName)
                .attr('data-layerid', layerModel.Id));
    }

    onLayerDeleted(model) {
        var targetlink = $("#privateLayersListContainer").find(`[data-layerid='${model.Id}']`);
        if (targetlink.length) {
            targetlink.remove();
        }
    }

    filterLayersByTags(userTags) {
        if (userTags && userTags.length) {
            var filteredLayers = _.filter(this.layersCache, layer => {
                return layer.UserTag && _.some(userTags, e => e.TagValue !== '' && e.TagValue == layer.UserTag.TagValue);
            });
            this.updateLayersSelection(filteredLayers);
        } else {
            this.updateLayersSelection(this.layersCache);
        }
    }

    content() {
        return `<div>  
                    <div class='menu-margins'>
                        <input id='manageTagsBtn' type='button' value='My Tags' />
                        <p />
                        <select class="user-tag-selector" name="usertags" multiple="multiple" >
                        </select>
                    </div>
                    <p />
                    <div class='menu-margins menu-content-vh'>
                        <ul id='privateLayersListContainer' class='layer-item-list'></ul>
                    </div>
                </div>`;
    }

    getManageTagsHtml() {
        return "<textarea id='tagEditorInput' rows='4' cols='50' />";
    }
}