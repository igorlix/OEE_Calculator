import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Platform, Modal, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { styles } from './styles'
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg';



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
  });

  const validarCampos = () => {
    return (
      inputs.duracaoTurno !== '' &&
      inputs.pausasCurtas !== '' &&
      inputs.pausaRefeicao !== '' &&
      inputs.tempoInatividade !== '' &&
      inputs.totalPecas !== '' &&
      inputs.pecasRejeitadas !== '' &&
      inputs.taxaExecucaoIdeal !== ''
    );
  };
  
  const [showHelp, setShowHelp] = useState(false);
  const [oeeResult, setOeeResult] = useState<{
    disponibilidade: number;
    desempenho: number;
    qualidade: number;
    total: number;
  } | null>(null);  const calcularOEE = () => {
    if (!validarCampos()) {
      return;
    }
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

  interface CircularProgressProps {
    size: number;
    strokeWidth: number;
    progress: number;
    color: string;
    label?: string;
    small?: boolean;
  }

  const CircularProgress = ({
                              size,
                              strokeWidth,
                              progress,
                              color,
                              label,
                              small = false
                            }: CircularProgressProps) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <View style={{ alignItems: 'center', margin: small ? 5 : 10 }}>
          <Svg width={size} height={size}>
            <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
              <Circle
                  stroke="#E0E0E0"
                  fill="transparent"
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  strokeWidth={strokeWidth}
              />
              <Circle
                  stroke={color}
                  fill="transparent"
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${circumference}, ${circumference}`}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
              />
            </G>
            <SvgText
                x={size / 2}
                y={size / 2 + (small ? 5 : 10)}
                textAnchor="middle"
                fill={color}
                fontSize={small ? 14 : 40}
                fontWeight="bold"
            >
              {`${progress}%`}
            </SvgText>
          </Svg>
          {label && (
              <Text style={[
                label === 'OEE Total' ? {
                  fontSize: 40,
                  fontWeight: 'bold',
                  color,
                  marginTop: 10
                } : {
                  color,
                  marginTop: 5,
                  fontWeight: '600',
                  fontSize: 16
                }
              ]}>
                {label}
              </Text>
          )}
        </View>
    );
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
                    placeholder="Ex:8 horas ou 480 minutos "
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

          <TouchableOpacity 
              style={[
                styles.button,
                !validarCampos() && styles.buttonDisabled
              ]} 
              onPress={calcularOEE}
              disabled={!validarCampos()}
            >
              <Text style={styles.buttonText}>Calcular OEE</Text>
          </TouchableOpacity>
        </View>

        {oeeResult !== null && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Resultado OEE</Text>
            
            {/* Gráficos das métricas individuais */}
            <View style={styles.metricsContainer}>
              <CircularProgress
                size={80}
                strokeWidth={8}
                progress={oeeResult.disponibilidade}
                color="#FFA500" // Laranja
                label="Disponibilidade"
                small
              />
              <CircularProgress
                size={80}
                strokeWidth={8}
                progress={oeeResult.desempenho}
                color="#4CAF50" // Verde
                label="Desempenho"
                small
              />
              <CircularProgress
                size={80}
                strokeWidth={8}
                progress={oeeResult.qualidade}
                color="#9C27B0" // Roxo
                label="Qualidade"
                small
              />
            </View>
            <View style={styles.oeeTotalContainer}>
            <CircularProgress
                size={200}
                strokeWidth={12}
                progress={oeeResult.total}
                color="#1a73e8"
                label="OEE Total" 
              />
              <Text style={[
                styles.resultStatus,
                { color: getOEEStatus(oeeResult.total).color }
              ]}>
                {getOEEStatus(oeeResult.total).text}
              </Text>
            </View>
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
            <View style={styles.modalTitleContainer}>
              <MaterialCommunityIcons name="information-outline" size={24} color="#1a73e8" />
              <Text style={styles.modalTitle}>Guia Completo do OEE</Text>
            </View>
            <TouchableOpacity 
              onPress={() => setShowHelp(false)}
              style={styles.closeButton}
            >
              <MaterialCommunityIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            style={styles.modalScroll}
            showsVerticalScrollIndicator={false}
          >
            {/* Seção OEE */}
            <View style={styles.helpSection}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="chart-donut" size={20} color="#1a73e8" />
                <Text style={styles.helpSectionTitle}>O que é OEE?</Text>
              </View>
              <Text style={styles.helpText}>
                O OEE (Overall Equipment Effectiveness) é um indicador que mede a eficiência real de um equipamento ou linha de produção, considerando três fatores críticos:
              </Text>
              
              <View style={styles.factorContainer}>
                <View style={[styles.factorPill, {backgroundColor: '#FFF3E0'}]}>
                  <MaterialCommunityIcons name="clock-outline" size={16} color="#FFA500" />
                  <Text style={[styles.helpSubtitle, {color: '#FFA500'}]}>Disponibilidade</Text>
                </View>
                <Text style={styles.factorDescription}>
                  Mede o tempo produtivo real comparado ao tempo planejado
                </Text>
              </View>
              
              <View style={styles.factorContainer}>
                <View style={[styles.factorPill, {backgroundColor: '#E8F5E9'}]}>
                  <MaterialCommunityIcons name="speedometer" size={16} color="#4CAF50" />
                  <Text style={[styles.helpSubtitle, {color: '#4CAF50'}]}>Desempenho</Text>
                </View>
                <Text style={styles.factorDescription}>
                  Avalia se a produção está ocorrendo na velocidade ideal
                </Text>
              </View>
              
              <View style={styles.factorContainer}>
                <View style={[styles.factorPill, {backgroundColor: '#F3E5F5'}]}>
                  <MaterialCommunityIcons name="quality-high" size={16} color="#9C27B0" />
                  <Text style={[styles.helpSubtitle, {color: '#9C27B0'}]}>Qualidade</Text>
                </View>
                <Text style={styles.factorDescription}>
                  Indica a proporção de peças boas em relação ao total produzido
                </Text>
              </View>
            </View>

            {/* Seção Cálculo */}
            <View style={styles.helpSection}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="calculator" size={20} color="#1a73e8" />
                <Text style={styles.helpSectionTitle}>Como é calculado?</Text>
              </View>
              
              <View style={styles.formulaCard}>
                <View style={styles.formulaRow}>
                  <MaterialCommunityIcons name="numeric-1-box" size={20} color="#1a73e8" />
                  <Text style={styles.formulaText}>
                    <Text style={styles.formulaHighlight}>Disponibilidade</Text> = (Tempo de Operação / Tempo de Produção Planejado) × 100
                  </Text>
                </View>
                
                <View style={styles.formulaRow}>
                  <MaterialCommunityIcons name="numeric-2-box" size={20} color="#1a73e8" />
                  <Text style={styles.formulaText}>
                    <Text style={styles.formulaHighlight}>Desempenho</Text> = ((Total de Peças / Tempo de Operação) / Taxa Ideal) × 100
                  </Text>
                </View>
                
                <View style={styles.formulaRow}>
                  <MaterialCommunityIcons name="numeric-3-box" size={20} color="#1a73e8" />
                  <Text style={styles.formulaText}>
                    <Text style={styles.formulaHighlight}>Qualidade</Text> = (Peças Boas / Total de Peças) × 100
                  </Text>
                </View>
                
                <View style={styles.formulaRow}>
                  <MaterialCommunityIcons name="equal-box" size={20} color="#1a73e8" />
                  <Text style={styles.formulaText}>
                    <Text style={styles.formulaHighlight}>OEE Total</Text> = (Disponibilidade × Desempenho × Qualidade) / 10000
                  </Text>
                </View>
              </View>
            </View>

            {/* Seção Uso */}
            <View style={styles.helpSection}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="toolbox-outline" size={20} color="#1a73e8" />
                <Text style={styles.helpSectionTitle}>Como utilizar esta ferramenta?</Text>
              </View>
              
              <View style={styles.stepContainer}>
                <View style={styles.stepIndicator}>
                  <Text style={styles.stepNumber}>1</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Preencha os dados</Text>
                  <Text style={styles.stepDescription}>
                    Insira todas as informações de produção nos campos correspondentes
                  </Text>
                </View>
              </View>
              
              <View style={styles.stepContainer}>
                <View style={styles.stepIndicator}>
                  <Text style={styles.stepNumber}>2</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Calcule o OEE</Text>
                  <Text style={styles.stepDescription}>
                    Clique no botão "Calcular OEE" para processar os dados
                  </Text>
                </View>
              </View>
              
              <View style={styles.stepContainer}>
                <View style={styles.stepIndicator}>
                  <Text style={styles.stepNumber}>3</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Analise os resultados</Text>
                  <Text style={styles.stepDescription}>
                    Verifique os gráficos e identifique oportunidades de melhoria
                  </Text>
                </View>
              </View>
            </View>

            {/* Seção Padrões */}
            <View style={styles.helpSection}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="medal-outline" size={20} color="#1a73e8" />
                <Text style={styles.helpSectionTitle}>Padrões Mundiais de OEE</Text>
              </View>
              
              <View style={styles.standardCard}>
                <View style={styles.standardBadge}>
                  <MaterialCommunityIcons name="trophy" size={16} color="#FFD700" />
                  <Text style={styles.standardTitle}>Classe Mundial</Text>
                </View>
                <Text style={styles.standardValue}>85% ou superior</Text>
                <Text style={styles.standardDescription}>
                  Padrão excelente encontrado nas indústrias mais eficientes
                </Text>
              </View>
              
              <View style={[styles.standardCard, {marginTop: 10}]}>
                <View style={styles.standardBadge}>
                  <MaterialCommunityIcons name="chart-line" size={16} color="#2196F3" />
                  <Text style={styles.standardTitle}>Média Global</Text>
                </View>
                <Text style={styles.standardValue}>~60%</Text>
                <Text style={styles.standardDescription}>
                  Valor médio encontrado na maioria das fábricas
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
    </SafeAreaView>
  );
}

