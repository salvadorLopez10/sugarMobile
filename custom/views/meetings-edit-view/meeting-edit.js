
const app = SUGAR.App;
const customization = require('%app.core%/customization.js');
const EditView = require('%app.views.edit%/modules/meetings-calls-edit-view.js');

const MeetingEditView = customization.extend(EditView, {


    initialize(options) {
        this._super(options);

        //Validación de fecha
        this.model.addValidationTask('ValidaFechaPermitida', _.bind(this.validaFechaInicialCall, this));

        this.model.on('sync', this.readOnlyStatus,this);
        this.model.on('data:sync:complete', this.disableObjective,this);        
    },

    _render: function()  
    {  
        this._super();  

        if(this.isCreate){

            this.disableStatus();  
        }
        
    },

    /* 
     * Valida que la Fecha Inicial no sea menor que la actual
     * 19/09/2018
     */
    validaFechaInicialCall: function (fields, errors, callback) {

        // FECHA INICIO
        var dateInicio = new Date(this.model.get("date_start"));
        var d = dateInicio.getDate();
        var m = dateInicio.getMonth() + 1;
        var y = dateInicio.getFullYear();
        var fechaCompleta = [m, d, y].join('/');
        // var dateFormat = dateInicio.toLocaleDateString();
        var fechaInicio = Date.parse(fechaCompleta);


        // FECHA ACTUAL
        var dateActual = new Date();
        var d1 = dateActual.getDate();
        var m1 = dateActual.getMonth() + 1;
        var y1 = dateActual.getFullYear();
        var dateActualFormat = [m1, d1, y1].join('/');
        var fechaActual = Date.parse(dateActualFormat);


        if (fechaInicio < fechaActual) {
            app.alert.show("Fecha no valida", {
                level: "error",
                title: "No puedes crear una Llamada con fecha menor al d&Iacutea de hoy",
                autoClose: false
            });

            app.error.errorName2Keys['custom_message1'] = 'La fecha no puede ser menor a la actual';
            errors['date_start'] = errors['date_start'] || {};
            errors['date_start'].custom_message1 = true;
        }
        callback(null, fields, errors);
    },

    /*
    * Función para evitar que el campo "Estado" se desbloquee al escribir en "Descripción" o 
    * en "Relacionado con"
    */
    onAfterShow(options){
      this.disableStatus();
    },

    /*
    * Se establecen como solo lectura el "Objetivo" y "Resultado" una vez que se ha sincronizado
    * completamente la información del registro y el Estado sea "Realizada" o "No Realizada"
    */
    disableObjective(){

        if((this.model.get('status')=="Held" && !this.isCreate) || (this.model.get('status')=="Not Held" && !this.isCreate)){

            $('select[name="objetivo_c"]').parent().parent().addClass("field--readonly");
            $('select[name="objetivo_c"]').parent().attr("style","pointer-events:none");

            $('select[name="resultado_c"]').parent().parent().addClass("field--readonly");
            $('select[name="resultado_c"]').parent().parent().attr("style","pointer-events:none");

        }


    },    


    /*
    * Se bloquea campo "Estado" al tener registro de Reunión como Realizada o No Realizada
    */

    readOnlyStatus: function(){

        if((this.model.get('status')=="Held" && !this.isCreate) || (this.model.get('status')=="Not Held" && !this.isCreate)){

            $('select[name="status"]').parent().parent().addClass("field--readonly");
            $('select[name="status"]').parent().attr("style","pointer-events:none");

        }

         //Se bloquea campo "Relacionado con"
        $('.field.fast-click-highlighted>.field__controls--flex').parent().attr('style','pointer-events:none');
        $('.field.fast-click-highlighted>.field__controls--flex').parent().removeClass('fast-click-highlighted');
        $('.field.fast-click-highlighted>.field__controls--flex').parent().addClass("field--readonly");
            
        $('.field.fast-click-highlighted>.field__controls--flex').addClass('field__controls--readonly');
        $('.field.fast-click-highlighted>.field__controls--flex').find(".inert").addClass('hide');
        $('.field.fast-click-highlighted>.field__controls--flex').removeClass('field__controls--flex');

    },

    /*
    * En la creación de registro de Reunión, el "Estado" nace como solo lectura
    */

    disableStatus: function(){

        $('select[name="status"]').parent().parent().addClass("field--readonly");
        $('select[name="status"]').parent().attr("style","pointer-events:none");

    },  


});

customization.register(MeetingEditView,{module: 'Meetings'});

module.exports = MeetingEditView;
