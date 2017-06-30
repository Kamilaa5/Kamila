import { create } from 'rung-sdk';
import { OneOf } from 'rung-cli/dist/types';
import Bluebird from 'bluebird';
import agent from 'superagent';
import promisifyAgent from 'superagent-promise';
import { path } from 'ramda';

const request = promisifyAgent(agent, Bluebird);

const styles = {
    name: {
        fontWeight: 'bold',
        color: 'white',
		margin: 0,
		width: 143
    },
	valor: {
		wordBreak: 'break-all'
	},
	geral: {
		position: 'absolute',
		margin: '-12 0 0 -11px',
		backgroundColor: '#3F51B5',
		height: 118,
		paddingTop: '7px'
	}
};

function render(loteria, valorAtual, numeroConcurso, dataSorteio, Acumulou) {
	return (
		<div style={ styles.geral }>
            <span style={ styles.name }>
				<span>{Acumulou ? 'Acumulou!! ' : ''}</span>
				<span>O resultado do sorteio da {loteria} é :</span>
				<p style={styles.valor}>{valorAtual.join(', ')}.</p>
				<span>Concurso {numeroConcurso} sorteado no dia {dataSorteio}.</span>
			</span>
        </div>
	);
}

function main(context, done) {

    const { loteria } = context.params;
	var loteriaurl = '';
	switch (loteria){
		case 'Megasena':
			loteriaurl = 'megasena';
		break;
		case 'Quina':
			loteriaurl = 'quina';
		break;
		case 'Loto fácil':
			loteriaurl = 'lotofacil';
		break;
		case 'Dupla Sena':
			loteriaurl = 'duplasena';
		break;
	}

	var url = 'https://api.vitortec.com/loterias/'+loteriaurl+'/v1.2/';
	request.get(url)
		.then(resultado => {
			const valorAtual = resultado.body.data.resultado.ordemCrescente;
			const numeroConcurso = resultado.body.data.concurso;
			const dataSorteio = resultado.body.data.data;
			const Acumulou = resultado.body.data.acumulou;

			done ({
				alerts: [{
					title: _(`Resultado da loteria ${loteria}`),
					content: render(loteria, valorAtual, numeroConcurso, dataSorteio, Acumulou),
					comment: `Resultado da loteria ${loteria}`
				}]
			});
		});
}

const loterias = [
	'Megasena',
	'Quina',
	'Loto fácil',
	'Dupla Sena'
];

const params = {
    loteria: {
        description: _('Deseja ser informado sobre os números sorteados referentes a qual loteria? Megasena, Quina, Loto fácil ou Dupla Sena'),
        type: OneOf(loterias),
		required: true
    }
};

export default create(main, {
    params,
    primaryKey: false,
    title: _("Resultado da loteria"),
    description: _("Seja informado os números sorteados na loteria!"),
    preview: render('Megasena', ['04', '05', '14', '37', '40', '60'], '1864', '08/10/2016', true)
});
