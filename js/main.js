$("#cep").focus(); //Da foco ao campo CEP

function limpaForm(){ //Cria a função que limpa o formulário
    $("#cep").val("");
    $("#uf").val("estado");
    $("#cidade").val("");
    $("#rua").val("");   
}

$("#limpar").click(function(){ //Chama a função limpaForm no clique do botão "Limpar"
    limpaForm();
});

$(document).keypress(function(e){ //Chama a função descubra ao teclar "Enter"
    if(e.which == 13){
        descubra();
    }
});

$("#enviar").on('click', descubra); //Chama a função descubra no clique do botão "Descubra"

function descubra(){ //Função principal
    //Remove qualquer possível erro
    removeErroEndereco("cep");
    removeErroEndereco("uf");
    removeErroEndereco("cidade");
    removeErroEndereco("rua");

    //Criam as variáveis a partir dos valores 
    var cep = $("#cep").val(); 
    var uf = $("#uf").val();
    var cidade = $("#cidade").val();
    var rua = $("#rua").val();

    //Corrige os valores
    rua = arrumaEndereco(rua); 
    cep = arrumaCep(cep);
    
    //Corrige o campo CEP
    $("#cep").val(cep); 
    
    if(validaCep(cep)==true){ //Testa se o CEP é válido antes de realizar a requisição
        $.ajax({ //Busca os dados a partir do CEP
            url : "https://viacep.com.br/ws/"+ cep +"/json/", 
            method: 'GET', 
            success : function(dados){ //Executa ao enviar/receber dados do servidor corretamente
                if(dados.erro == true){ //Mesmo após enviar/receber dados do servidor, pode retornar com erro, no caso de CEP inexistente
                    insereErroEndereco("cep");
                    limpaForm();
                }else{
                    insereEndereco(dados);
                    removeErroEndereco("cep");
                }
        },
            error : function(error){ //Executa quando ocorre algum problema http
                insereErroEndereco("cep");
                limpaForm();
            }
        });
    }else if(cep==''){
        if((rua.length<3)||(cidade.length<3)||(uf=='estado')){
            if(rua.length<3){
                insereErroEndereco("rua");
            }
            if(cidade.length<3){
                insereErroEndereco("cidade");
            }
            if(uf=='estado'){
                insereErroEndereco("uf");
            }
        }else{
            $.ajax({ //Busca os dados a partir do endereço
                url : "https://viacep.com.br/ws/"+ uf +"/"+ cidade +"/"+ rua +"/json/", 
                method: 'GET', 
                success : function(dados){ //Executa ao enviar/receber dados do servidor corretamente
                    if((dados == '')){ //Mesmo após enviar/receber dados do servidor, pode não localizar o CEP, no caso de endereço inválido
                        insereErroEndereco("rua");
                        insereErroEndereco("cidade");
                    }else if(dados.length>1){ //Testa se recebe mais de um CEP como resultado
                        alert("Foram encontrados mais de um resultados, o primeiro resultado será exibido.");
                        removeErroEndereco("rua");
                        removeErroEndereco("cidade");
                        insereCep(dados);
                    }else{
                        removeErroEndereco("rua");
                        removeErroEndereco("cidade");
                        insereCep(dados);
                    }
            },
                error : function(error){ //Executa quando ocorre algum problema http
                    insereErroEndereco("rua");
                    insereErroEndereco("cidade");
                }
            });
        }
    }
}
function insereEndereco(dados){ //Insere o endereço nos campos, após busca pelo cep
    $("#uf").val(dados.uf.toLowerCase());
    $("#cidade").val(dados.localidade);
    $("#rua").val(dados.logradouro); 
}

function insereCep(dados){ //Insere CEP no campo, após busca pelo endereço (também corrige o endereço)
    $("#cep").val(arrumaCep(dados[0].cep));
    $("#cidade").val(dados[0].localidade);
    $("#rua").val(dados[0].logradouro);
}

function arrumaCep(cep){ //Remove caracteres do CEP
    cep = cep.replace(/\./g,'');
    cep = cep.replace(/\ /g,'');
    cep = cep.replace(/\-/g,'');
    return cep;
}

function arrumaEndereco(endereco){ //Remove caracteres do endereço (troca os espaços por +)
    endereco = endereco.replace(/\./g,'');
    endereco = endereco.replace(/\ /g,'+');
    endereco = endereco.replace(/\-/g,'');
    return endereco;
}

function validaCep(cep){ //Valida o CEP, aceitando apenas 8 ou nenhum carcter
    if((cep.length == 8)||(cep!='')){
        return true;
    }else{
        return false;
    }
}

function insereErroEndereco(parametro){
    $("#"+parametro).addClass("error");
    $("."+parametro+"-erro").removeClass("hidden");
}

function removeErroEndereco(parametro){
    $("#"+parametro).removeClass("error");
    $("."+parametro+"-erro").addClass("hidden");
}


    
              