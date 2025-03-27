import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Platform, Modal, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { styles } from './styles'



export default function HomeScreen() {  const [inputs, setInputs] = useState({
    duracaoTurno: '',
    unidadeTurno: 'minutos',
    pausasCurtas: '',
    pausaRefeicao: '',
    tempoInatividade: '',
    totalPecas: '',
    pecasRejeitadas: '',
    taxaExecucaoIdeal: '',
    unidadeTaxaExecucao: 'minutos'
  });  const [showHelp, setShowHelp] = useState(false);
  const [oeeResult, setOeeResult] = useState<{
    disponibilidade: number;
    desempenho: number;
    qualidade: number;
    total: number;
  } | null>(null);  const calcularOEE = () => {
    const valores = {
      duracaoTurno: parseFloat(inputs.duracaoTurno) || 0,
      pausasCurtas: parseFloat(inputs.pausasCurtas) || 0,
      pausaRefeicao: parseFloat(inputs.pausaRefeicao) || 0,
      tempoInatividade: parseFloat(inputs.tempoInatividade) || 0,
      totalPecas: parseFloat(inputs.totalPecas) || 0,
      pecasRejeitadas: parseFloat(inputs.pecasRejeitadas) || 0,
      taxaExecucaoIdeal: parseFloat(inputs.taxaExecucaoIdeal) || 0
    };

    const duracaoTurnoMinutos = inputs.unidadeTurno === 'horas' 
      ? valores.duracaoTurno * 60 
      : valores.duracaoTurno;

    const tempoProducaoPlanejado = duracaoTurnoMinutos - (valores.pausasCurtas + valores.pausaRefeicao);

    const tempoOperacao = tempoProducaoPlanejado - valores.tempoInatividade;

    const boasPecas = valores.totalPecas - valores.pecasRejeitadas;
    
    const disponibilidade = (tempoOperacao / tempoProducaoPlanejado) * 100;
    
    const taxaExecucaoIdealMinutos = inputs.unidadeTaxaExecucao === 'horas' 
      ? valores.taxaExecucaoIdeal / 60 
      : valores.taxaExecucaoIdeal;

    const desempenho = (valores.totalPecas / (tempoOperacao * taxaExecucaoIdealMinutos)) * 100;
    
    const qualidade = (boasPecas / valores.totalPecas) * 100;
    

    const oeeTotal = (disponibilidade / 100) * (desempenho / 100) * (qualidade / 100) * 100;

    setOeeResult({
      disponibilidade: Number(disponibilidade.toFixed(2)),
      desempenho: Number(desempenho.toFixed(2)),
      qualidade: Number(qualidade.toFixed(2)),
      total: Number(oeeTotal.toFixed(2))
    });
  };

  const getOEEStatus = (oee: number) => {
    if (oee >= 85) return { text: 'Excelente', color: '#4CAF50' };
    if (oee >= 75) return { text: 'Bom', color: '#2196F3' };
    if (oee >= 65) return { text: 'Regular', color: '#FFC107' };
    return { text: 'Precisa Melhorar', color: '#F44336' };
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <MaterialCommunityIcons name="chart-donut" size={40} color="#1a73e8" />
            <Text style={styles.title}>Calculadora OEE</Text>
          </View>
          <TouchableOpacity 
            onPress={() => setShowHelp(true)}
            style={styles.helpButton}
          >
            <MaterialCommunityIcons name="help-circle-outline" size={28} color="#1a73e8" />
          </TouchableOpacity>
        </View>
        <View style={styles.card}>          <View style={styles.inputContainer}>
            <Text style={styles.label}>Duração do Turno</Text>
            <View style={styles.timeInputContainer}>
              <View style={styles.timeInputWrapper}>
                <TextInput
                    style={[styles.input, styles.inputWithSuffix]}
                    keyboardType="numeric"
                    value={inputs.duracaoTurno}
                    onChangeText={(value) => {
                    const numericValue = value.replace(/[^0-9]/g, '');
                    setInputs(prev => ({ ...prev, duracaoTurno: numericValue }));
                    }}
                    placeholder="Ex: 8 horas ou 480 minutos"
                    placeholderTextColor="#999"
                />
                <TouchableOpacity
                    style={styles.unitSelector}
                    onPress={() => setInputs(prev => ({
                    ...prev,
                    unidadeTurno: prev.unidadeTurno === 'horas' ? 'minutos' : 'horas'
                    }))}
                >
                    <Text style={styles.unitText}>{inputs.unidadeTurno === 'horas' ? 'hrs' : 'min'}</Text>
                </TouchableOpacity>
            </View>
            </View>
          </View>          <View style={styles.inputContainer}>
            <Text style={styles.label}>Pausas Curtas</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.input, styles.inputWithSuffix]}
                keyboardType="numeric"
                value={inputs.pausasCurtas}                onChangeText={(value) => {
                  const numericValue = value.replace(/[^0-9]/g, '');
                  setInputs(prev => ({ ...prev, pausasCurtas: numericValue }));
                }}
                placeholder="Ex: 30 minutos"
                placeholderTextColor="#999"
              />
              <Text style={styles.suffix}>min</Text>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Pausa para Refeição</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.input, styles.inputWithSuffix]}
                keyboardType="numeric"
                value={inputs.pausaRefeicao}                onChangeText={(value) => {
                  const numericValue = value.replace(/[^0-9]/g, '');
                  setInputs(prev => ({ ...prev, pausaRefeicao: numericValue }));
                }}
                placeholder="Ex: 60 minutos"
                placeholderTextColor="#999"
              />
              <Text style={styles.suffix}>min</Text>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Tempo de Inatividade</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.input, styles.inputWithSuffix]}
                keyboardType="numeric"
                value={inputs.tempoInatividade}                onChangeText={(value) => {
                  const numericValue = value.replace(/[^0-9]/g, '');
                  setInputs(prev => ({ ...prev, tempoInatividade: numericValue }));
                }}
                placeholder="Ex: 30 minutos"
                placeholderTextColor="#999"
              />
              <Text style={styles.suffix}>min</Text>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Total de Peças</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.input, styles.inputWithSuffix]}
                keyboardType="numeric"
                value={inputs.totalPecas}                onChangeText={(value) => {
                  const numericValue = value.replace(/[^0-9]/g, '');
                  setInputs(prev => ({ ...prev, totalPecas: numericValue }));
                }}
                placeholder="Ex: 3.000 peças"
                placeholderTextColor="#999"
              />
              <Text style={styles.suffix}>pçs</Text>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Peças Rejeitadas</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.input, styles.inputWithSuffix]}
                keyboardType="numeric"
                value={inputs.pecasRejeitadas}                onChangeText={(value) => {
                  const numericValue = value.replace(/[^0-9]/g, '');
                  setInputs(prev => ({ ...prev, pecasRejeitadas: numericValue }));
                }}
                placeholder="Ex: 10 peças"
                placeholderTextColor="#999"
              />
              <Text style={styles.suffix}>pçs</Text>
            </View>
          </View>          <View style={styles.inputContainer}>
            <Text style={styles.label}>Peças por unidade de tempo</Text>
            <View style={styles.timeInputContainer}>
              <View style={styles.timeInputWrapper}>
                <TextInput
                    style={[styles.input, styles.inputWithSuffix]}
                    keyboardType="numeric"
                    value={inputs.taxaExecucaoIdeal}
                    onChangeText={(value) => {
                        const numericValue = value.replace(/[^0-9]/g, '');
                        setInputs(prev => ({ ...prev, taxaExecucaoIdeal: numericValue }));
                    }}
                  placeholder="Ex: 10 pçs/unidade de tempo"
                  placeholderTextColor="#999"
                />
                <TouchableOpacity
                    style={styles.unitSelector}
                    onPress={() => setInputs(prev => ({
                    ...prev,
                    unidadeTaxaExecucao: prev.unidadeTaxaExecucao === 'horas' ? 'minutos' : 'horas'
                    }))}
                >
                  <Text style={styles.unitText}>{`pçs/${inputs.unidadeTaxaExecucao === 'horas' ? 'hora' : 'min'}`}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={calcularOEE}>
            <Text style={styles.buttonText}>Calcular OEE</Text>
          </TouchableOpacity>
        </View>

        {oeeResult !== null && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Resultado OEE</Text>
            <View style={styles.componentResults}>
              <Text style={styles.componentText}>Disponibilidade: {oeeResult.disponibilidade}%</Text>
              <Text style={styles.componentText}>Desempenho: {oeeResult.desempenho}%</Text>
              <Text style={styles.componentText}>Qualidade: {oeeResult.qualidade}%</Text>
            </View>
            <Text style={styles.resultValue}>{oeeResult.total}%</Text>
            <Text style={[
              styles.resultStatus,
              { color: getOEEStatus(oeeResult.total).color }
            ]}>
              {getOEEStatus(oeeResult.total).text}
            </Text>
          </View>

          
          
        )}
        <View style={styles.watermarkContainer}>
        <TouchableOpacity 
          style={styles.watermark}
          onPress={() => Linking.openURL('https://github.com/igorlix')}
        >
          <FontAwesome name="github" size={20} color="#1a73e8" />
          <Text style={styles.watermarkText}>igorlix</Text>
        </TouchableOpacity>
      </View>

     </ScrollView>
     

       <Modal
          animationType="slide"
          transparent={true}
          visible={showHelp}
          onRequestClose={() => setShowHelp(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Guia do OEE</Text>
                <TouchableOpacity onPress={() => setShowHelp(false)}>
                  <MaterialCommunityIcons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modalScroll}>
                <Text style={styles.helpSectionTitle}>O que é OEE?</Text>
                <Text style={styles.helpText}>
                  O OEE é um índice que avalia três principais fatores:
                </Text>
                
                <Text style={styles.helpSubtitle}>Disponibilidade:</Text>
                <Text style={styles.helpText}>Mede o tempo produtivo real comparado ao tempo planejado.</Text>
                
                <Text style={styles.helpSubtitle}>Desempenho:</Text>
                <Text style={styles.helpText}>Avalia se a produção está ocorrendo na velocidade ideal.</Text>
                
                <Text style={styles.helpSubtitle}>Qualidade:</Text>
                <Text style={styles.helpText}>Indica a proporção de peças boas em relação ao total produzido.</Text>
                
                <Text style={styles.helpText}>
                  Esses três fatores combinados resultam no OEE Total, que fornece uma visão completa da eficiência operacional da linha de produção.
                </Text>

                {/* Nova seção adicionada com as fórmulas */}
                <Text style={styles.helpSectionTitle}>Como é calculado?</Text>
                <Text style={styles.helpText}>
                🔹 Disponibilidade = (Tempo de Operação / Tempo de Produção Planejado) x 100
                </Text>
                <Text style={styles.helpText}>
                🔹 Desempenho = ((Total de Peças / Tempo de Operação) / Taxa de Execução Ideal) x 100
                </Text>
                <Text style={styles.helpText}>
                🔹 Qualidade = (Peças Boas / Total de Peças) x 100
                </Text>
                <Text style={styles.helpText}>
                🔹 OEE Total = (Disponibilidade x Desempenho x Qualidade) / 10000
                </Text>

                <Text style={styles.helpSectionTitle}>Como utilizar esta ferramenta?</Text>
                <Text style={styles.helpText}>
                    🔹 Insira os dados de produção, incluindo tempo de turno, pausas, tempo de inatividade, total de peças produzidas e rejeitadas.{'\n\n'}
                    🔹 Clique no botão "Calcular OEE" para obter os resultados.{'\n\n'}
                    🔹 Analise os índices gerados para identificar possíveis gargalos e melhorar a eficiência produtiva.
                </Text>

                <Text style={styles.helpSectionTitle}>Padrões Mundiais de OEE</Text>
                <Text style={styles.helpText}>
                  🔹 O OEE de Classe Mundial para indústrias de manufatura discreta é geralmente 85% ou superior.{'\n\n'}
                  🔹 Estudos indicam que a média global do OEE em fábricas de manufatura discreta é de aproximadamente 60%.
                </Text>
              </ScrollView>
            </View>
          </View>
        </Modal>
    </SafeAreaView>
  );
}

