<script lang="ts">
	import { ScriptService, FlowService } from '$lib/gen'

	import Icon from 'svelte-awesome'
	import { faSearch } from '@fortawesome/free-solid-svg-icons'
	import { hubScripts, workspaceStore } from '$lib/stores'
	import { createEventDispatcher } from 'svelte'
	import ItemPicker from './ItemPicker.svelte'
	import Modal from './Modal.svelte'
	import { Highlight } from 'svelte-highlight'
	import typescript from 'svelte-highlight/languages/typescript'
	import python from 'svelte-highlight/languages/python'

	import { getScriptByPath } from '$lib/utils'
	import RadioButton from './RadioButton.svelte'

	export let scriptPath: string | undefined = undefined
	export let allowFlow = false
	export let allowHub = false
	export let itemKind: 'hub' | 'script' | 'flow' = allowHub ? 'hub' : 'script'
	export let isTrigger: boolean | undefined = undefined

	let items: { summary: String; path: String; version?: String }[] = []
	let itemPicker: ItemPicker
	let modalViewer: Modal
	let code: string = ''
	let lang: 'deno' | 'python3' | undefined

	let options: [[string, any]] = [['Script', 'script']]
	allowHub && options.unshift(['Hub', 'hub'])
	allowFlow && options.push(['Flow', 'flow'])
	const dispatch = createEventDispatcher()

	async function loadItems(): Promise<void> {
		if (itemKind == 'flow') {
			items = await FlowService.listFlows({ workspace: $workspaceStore! })
		} else if (itemKind == 'script') {
			items = await ScriptService.listScripts({ workspace: $workspaceStore!, isTrigger })
		} else {
			items = $hubScripts ?? []
		}
	}

	$: {
		if ($workspaceStore) {
			loadItems()
		}
	}
</script>

<ItemPicker
	bind:this={itemPicker}
	pickCallback={(path, _) => {
		scriptPath = path
		dispatch('select', { path: scriptPath })
	}}
	itemName={itemKind == 'flow' ? 'Flow' : 'Script'}
	extraField="summary"
	loadItems={async () => {
		await loadItems()
		return items
	}}
/>

<div class="flex flex-row items-center space-x-5">
	<div class="w-80">
		{#if options.length > 1}
			<RadioButton bind:value={itemKind} {options} />
		{/if}
	</div>

	<input type="text" value={scriptPath ?? 'No path chosen yet'} disabled />
	<button class="default-button text-gray-100" on:click={() => itemPicker.openModal()}
		>Pick a {itemKind} path<Icon class="mx-4" data={faSearch} /></button
	>
	{#if scriptPath != undefined && scriptPath != ''}
		<button
			class="text-xs text-blue-500"
			on:click={async () => {
				const { language, content } = await getScriptByPath(scriptPath ?? '')
				code = content
				lang = language
				modalViewer.openModal()
			}}>show code</button
		>
	{/if}
</div>

<Modal bind:this={modalViewer}>
	<div slot="title">Script {scriptPath}</div>
	<div slot="content">
		{#if lang == 'python3'}
			<Highlight language={python} {code} />
		{:else if lang == 'deno'}
			<Highlight language={typescript} {code} />
		{/if}
	</div>
</Modal>
